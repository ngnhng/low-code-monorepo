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

	Row      []RowValue
	RowValue interface{}
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

	var rowValues []RowValue
	for _, row := range rows {
		rowValues = append(rowValues, row...)
	}

	// Convert []RowValue to []interface{}
	interfaceRowValues := make([]interface{}, len(rowValues))
	for i, v := range rowValues {
		interfaceRowValues[i] = v
	}

	sql, err := parameterizeInsertQuery(table, len(rows), len(columns))
	if err != nil {
		uc.Logger.Debugf("error parsing insert query: %v", err)
		return err
	}

	uc.Logger.Debugf("insert query: %v", sql)
	uc.Logger.Debugf("insert values: %v", interfaceRowValues)
	uc.Logger.Debugf("inserting data: %v", data)
	uc.Logger.Debugf("inserting into table: %v", table)

	// begin insert transaction
	connPool.ExecTx(c, func(p *pgx.Pgx) error {
		_, err := p.ConnPool.Query(c, sql, interfaceRowValues...)
		if err != nil {
			return err
		}

		return nil
	})

	return nil
}

// parseValues accepts a data object and returns a slice of rows, if there
// is missing column in data, consider it as NULL
func parseValues(columns []domain.Column, data *domain.InsertRowRequest) ([]Row, error) {
	rows := make([]Row, len(data.Rows))

	for i, row := range data.Rows {
		r := make(Row, len(columns))

		for j, col := range columns {
			if v, ok := row[col.Id]; ok {
				parsed, err := parseValue(col.Type, v)
				if err != nil {
					return nil, err
				}

				r[j] = parsed

			} else {
				r[j] = nil
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
		val, err := json.Marshal(v)
		if err != nil {
			return nil, err
		}
		return val, nil
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
		"INSERT INTO \"%s\" (%s) VALUES %s",
		table.Name,
		strings.Join(columnNames, ", "),
		strings.Join(valuePlaceholders, ", "),
	)

	return sql, nil
}
