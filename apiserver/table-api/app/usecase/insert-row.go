package usecase

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"
	"yalc/dbms/domain"
	"yalc/dbms/modules/config"
	"yalc/dbms/modules/logger"
	"yalc/dbms/modules/pgx"

	v5 "github.com/jackc/pgx/v5"

	"yalc/dbms/shared"

	"github.com/shopspring/decimal"
	"go.uber.org/fx"
)

type (
	InsertRowUseCase struct {
		Config *config.Config
		Logger logger.Logger

		Pgx *pgx.PgxManager
	}

	InsertRowUseCaseParams struct {
		fx.In

		Config *config.Config
		Logger logger.Logger

		Pgx *pgx.PgxManager
	}

	Row struct {
		Cells []Cell
	}

	Cell struct {
		Value any
		Link  *LinkValue
	}

	LinkValue struct {
		TableId  string
		ColumnId string
		// ids of the rows of another table to be linked
		RowIds []int
	}
)

func NewInsertRowUseCase(p InsertRowUseCaseParams) *InsertRowUseCase {
	return &InsertRowUseCase{
		Config: p.Config,
		Logger: p.Logger,
		Pgx:    p.Pgx,
	}
}

func (uc *InsertRowUseCase) Execute(
	ctx shared.RequestContext,
	projectId string,
	tableId string,
	data *domain.InsertRowRequest,
) error {

	c := ctx.GetContext()

	// get the table definition
	userDbPool, err := uc.Pgx.GetOrCreateUserPgxPool()
	if err != nil {
		uc.Logger.Debugf("error getting user pgx pool: %v", err)
		return err
	}

	table, err := userDbPool.GetTableInfo(c, tableId)
	if err != nil {
		uc.Logger.Debugf("error getting table info: %v", err)
		return err
	}

	// Get a connection pool of the database
	connPool, err := uc.Pgx.GetOrCreatePgxPool(shared.GenerateDatabaseName(projectId, ctx.GetUserId()))
	if err != nil {
		uc.Logger.Debugf("error getting pgx pool: %v", err)
		return err
	}

	columns := table.Columns
	rows, err := parseValues(columns, data)
	if err != nil {
		uc.Logger.Debugf("error parsing values: %v", err)
		return err
	}

	// chain multiple rows into a single slice
	var rowValues []any
	for _, row := range rows {
		// extract values from each row
		values := make([]any, len(row.Cells))
		for i, cell := range row.Cells {
			values[i] = cell.Value
		}

		rowValues = append(rowValues, values...)
	}

	//// Convert []RowValue to []interface{}
	//interfaceRowValues := make([]interface{}, len(rowValues))
	//for i, v := range rowValues {
	//	interfaceRowValues[i] = v
	//}

	sql, err := parameterizeInsertQuery(table, len(rows), len(columns))
	if err != nil {
		uc.Logger.Debugf("error parsing insert query: %v", err)
		return err
	}

	uc.Logger.Debugf("insert query: %v", sql)
	uc.Logger.Debugf("insert values: %v", rowValues)
	uc.Logger.Debugf("inserting data: %v", data)
	uc.Logger.Debugf("inserting into table: %v", table)

	return connPool.ExecuteTransaction(c, func(tx v5.Tx) error {
		resultRows, err := tx.Query(c, sql, rowValues...)
		if err != nil {
			uc.Logger.Debugf("error inserting rows: %v", err)
			return err
		}

		defer resultRows.Close()

		ids := make([]int, 0)

		for resultRows.Next() {
			var id int
			err = resultRows.Scan(&id)
			if err != nil {
				return err
			}
			ids = append(ids, id)
		}

		// if there are no rows inserted, return an error
		if len(ids) == 0 {
			return fmt.Errorf("no rows inserted")
		}

		// for each row, if link is not nil, update the link value of the associated column
		for i, row := range rows {
			for _, cell := range row.Cells {
				if cell.Link != nil {

					tableId := cell.Link.TableId
					columnId := cell.Link.ColumnId
					linkedColumnIds, ok := cell.Value.([]int)
					if !ok {
						uc.Logger.Errorf("error converting interface{}: %v", cell.Value)
						return fmt.Errorf("error converting interface{}: %v", cell.Value)
					}

					//// convert the interface{} to string
					//jsonBytes, ok := cell.Value.([]byte)
					//if !ok {
					//	uc.Logger.Errorf("error converting interface{}: %v", cell.Value)
					//	return fmt.Errorf("error converting interface{}: %v", cell.Value)
					//}

					//// unmarshal the JSON data into a string
					//var jsonString string
					//err := json.Unmarshal(jsonBytes, &jsonString)
					//if err != nil {
					//	uc.Logger.Errorf("error unmarshalling JSON data into string: %v", err)
					//	return err
					//}

					//// unmarshal the JSON string into a slice of integers
					//var linkedColumnIds []int
					//err = json.Unmarshal([]byte(jsonString), &linkedColumnIds)
					//if err != nil {
					//	uc.Logger.Errorf("error unmarshalling linked column ids: %v", err)
					//	return err
					//}

					// get the table definition
					linkTable, err := userDbPool.GetTableInfo(c, tableId)
					if err != nil {
						return err
					}

					updateQuery := `UPDATE "%s" SET "%s" = COALESCE("%s", '[]'::jsonb) || $1::jsonb WHERE id = $2;`

					jsonArr := fmt.Sprintf("[%d]", ids[i])

					uc.Logger.Debugf(
						"updating link column query: %v \n params: %v %v",
						fmt.Sprintf(updateQuery, linkTable.Name, columnId, columnId),
						jsonArr,
						linkedColumnIds,
					)

					for _, linkedColumnId := range linkedColumnIds {
						// update the linked column
						tag, err := tx.Exec(
							c,
							fmt.Sprintf(
								updateQuery,
								linkTable.Name,
								columnId,
								columnId,
							),
							jsonArr,
							linkedColumnId,
						)
						if err != nil || tag.RowsAffected() == 0 {
							uc.Logger.Errorf("error updating linked column: %v", err)
							return fmt.Errorf("error updating linked column: %v", err)
						}
					}
				}
			}
		}

		return nil
	})

}

// parseValues accepts a data object and returns a slice of rows, if there
// is missing column in data, consider it as NULL
func parseValues(columns []domain.Column, data *domain.InsertRowRequest) ([]Row, error) {
	rows := make([]Row, len(data.Rows))

	// iterate over each new row to be inserted
	for i, row := range data.Rows {

		// create a row object
		r := Row{
			Cells: make([]Cell, len(columns)),
		}

		// for each column, parse the new value
		for j, col := range columns {
			// if the column is present in the data, parse the value
			if v, ok := row[col.Id]; ok {
				parsed, err := parseValue(col.Type, v)
				if err != nil {
					return nil, err
				}

				// if the column is a link, create a link value
				if col.Type == domain.ColumnTypeLink {
					link := &LinkValue{
						TableId:  col.Reference.TableId,
						ColumnId: col.Reference.ColumnId,
					}

					// parse row ids
					err = json.Unmarshal([]byte(v), &link.RowIds)
					if err != nil {
						return nil, err
					}

					r.Cells[j] = Cell{
						Value: nil,
						Link:  link,
					}

				}

				r.Cells[j].Value = parsed

			} else {

				// if the column is not present in the data, consider it as NULL
				r.Cells[j].Value = nil
			}
		}

		rows[i] = r
	}

	return rows, nil
}

func parseValue(colType domain.ColumnType, v string) (interface{}, error) {
	switch colType {
	case domain.ColumnTypeBoolean:
		return strconv.ParseBool(v)
	case domain.ColumnTypeCurrency:
		return decimal.NewFromString(v)
	case domain.ColumnTypeDate:
		return time.Parse("2006-01-02", v)
	case domain.ColumnTypeInteger:
		return strconv.ParseInt(v, 10, 64)
	case domain.ColumnTypeString:
		return v, nil
	case domain.ColumnTypeTime:
		return time.Parse("15:04:05", v)
	case domain.ColumnTypeDateTime:
		return time.Parse("2006-01-02 15:04:05", v)
	case domain.ColumnTypeLink:
		var linkIds []int
		err := json.Unmarshal([]byte(v), &linkIds)
		if err != nil {
			return nil, err
		}
		return linkIds, nil
	default:
		return nil, fmt.Errorf("unknown column type: %v", colType)
	}
}

// produces a parameterized insert query such as:
// INSERT INTO table_name (column1, column2, column3) VALUES ($1, $2, $3)
func parameterizeInsertQuery(table *domain.Table, numberOfRows, cellsPerRow int) (string, error) {
	if numberOfRows == 0 || cellsPerRow == 0 {
		return "", fmt.Errorf("rows or columns are empty")
	}

	columns := table.Columns

	// Prepare column names
	columnNames := make([]string, len(columns))
	for i, col := range columns {
		columnNames[i] = fmt.Sprintf("\"%s\"", col.Id)
	}

	// Prepare placeholders for values
	valuePlaceholders := make([]string, numberOfRows)
	for i := range valuePlaceholders {
		placeholders := make([]string, len(columns))
		rowIdx := i * len(columns)
		for j := range columns {
			idx := rowIdx + j
			placeholders[j] = fmt.Sprintf("$%d", idx+1)
		}
		valuePlaceholders[i] = fmt.Sprintf("(%s)", strings.Join(placeholders, ", "))
	}

	sql := fmt.Sprintf(
		"INSERT INTO \"%s\" (%s) VALUES %s RETURNING id",
		table.Name,
		strings.Join(columnNames, ", "),
		strings.Join(valuePlaceholders, ", "),
	)

	return sql, nil
}
