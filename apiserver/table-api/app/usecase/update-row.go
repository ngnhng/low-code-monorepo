package usecase

import (
	"context"
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

	v5 "github.com/jackc/pgx/v5"

	decimal "github.com/jackc/pgx-shopspring-decimal"
	"github.com/jackc/pgx/v5/pgtype"
	"go.uber.org/fx"
)

type (
	UpdateRowUseCase struct {
		Config *config.Config
		Logger logger.Logger

		Pgx *pgx.PgxManager
	}

	UpdateRowUseCaseParams struct {
		fx.In

		Config *config.Config
		Logger logger.Logger

		Pgx *pgx.PgxManager
	}

	UpdateRowValues struct {
		Id     string
		Values []string
	}
)

func NewUpdateRowUseCase(p UpdateRowUseCaseParams) *UpdateRowUseCase {
	return &UpdateRowUseCase{
		Config: p.Config,
		Logger: p.Logger,
		Pgx:    p.Pgx,
	}
}

func (uc *UpdateRowUseCase) Execute(
	ctx shared.RequestContext,
	projectId string,
	tableId string,
	data *domain.UpdateRowRequest,
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

	columns := make([]string, 0, len(table.Columns))
	columnsQuoted := make([]string, 0, len(columns))
	for _, col := range table.Columns {
		columns = append(columns, col.Id)
		columnsQuoted = append(columnsQuoted, addDoubleQuotes(col.Id))

	}

	columnIds := make([]string, 0, len(columns))
	for _, col := range columns {
		columnIds = append(columnIds, addDoubleQuotes(col))
	}

	// parse the value to be updated
	// value1, value2, value3, ...
	values := make([]UpdateRowValues, 0, len(*data))
	for _, row := range *data {
		values = append(values, UpdateRowValues{
			Id:     row.RowId,
			Values: reorderOnMap(row.Values, columns),
		})
	}

	// setter
	// SET col1 = new_values.col1, col2 = new_values.col2, ...
	setter := ""
	for i, col := range columnsQuoted {
		if i > 0 {
			setter += ", "
		}
		setter += col + " = new_values." + col
	}

	// WHERE
	// WHERE id = new_values.id
	where := fmt.Sprintf("\"%s\".id = new_values.id", table.Name)

	sql := `WITH new_values (id, %s) AS ( VALUES %s ) UPDATE "%s" SET %s FROM new_values WHERE %s`

	// generate the values
	valuesStr := ""
	for i, row := range values {
		if i > 0 {
			valuesStr += ", "
		}
		quotedValues := make([]string, len(row.Values))
		for j, val := range row.Values {
			// check if val is numeric
			//if _, err := strconv.ParseFloat(val, 64); err == nil {
			//	// val is numeric, don't add quotes
			//	quotedValues[j] = val
			//} else {
			//	// val is not numeric, check for type
			//	if table.Columns[j].Type != domain.ColumnTypeString {
			//		// use null if not string
			//		val = "null"
			//		// add type casting
			//		cast := getCastOperator(table.Columns[j].Type)
			//		//if table.Columns[j].Type == domain.ColumnTypeInteger {
			//		//	cast = "integer"
			//		//} else if table.Columns[j].Type == domain.ColumnTypeDate {
			//		//	cast = "date"
			//		//}

			//		quotedValues[j] = fmt.Sprintf("%s::%s", val, cast)
			//	} else {
			//		quotedValues[j] = fmt.Sprintf("'%s'", val)
			//	}
			//}

			if parsedVal, err := shared.ParseValue(table.Columns[j].Type, val); err == nil {
				quotedValues[j] = parseToPostgresValue(parsedVal)
			} else {
				quotedValues[j] = shared.ParseNullOperator(table.Columns[j].Type)
			}
		}
		valuesStr += "(" + row.Id + ", " + strings.Join(quotedValues, ", ") + ")"
	}

	sql = fmt.Sprintf(sql, strings.Join(columnIds, ", "), valuesStr, table.Name, setter, where)

	uc.Logger.Debugf("update query: %v", sql)

	// Get a connection pool of the database
	connPool, err := uc.Pgx.GetOrCreatePgxPool(shared.GenerateDatabaseName(projectId, ctx.GetUserId()))
	if err != nil {
		uc.Logger.Debugf("error getting pgx pool: %v", err)
		return err
	}

	return connPool.ExecuteTransaction(c, func(cc context.Context, tx v5.Tx) error {
		tag, err := tx.Exec(cc, sql)
		if err != nil {
			uc.Logger.Errorf("error executing update query: %v", err)
			return err
		}

		if tag.RowsAffected() == 0 {
			uc.Logger.Debugf("no rows updated")
			return fmt.Errorf("no rows updated")
		}

		return nil
	})

}

func reorderOnMap(m map[string]string, keys []string) []string {
	var result []string
	for _, k := range keys {
		result = append(result, m[k])
	}
	return result
}

func addDoubleQuotes(s string) string {
	return "\"" + s + "\""
}

func parseStringToPostgresTypes(s string) string {
	return "'" + s + "'"
}

func getCastOperator(t domain.ColumnType) string {
	switch t {
	case domain.ColumnTypeString:
		return "text"
	case domain.ColumnTypeInteger:
		return "integer"
	case domain.ColumnTypeDate:
		return "date"
	case domain.ColumnTypeTime:
		return "time"
	case domain.ColumnTypeDateTime:
		return "timestamp"
	case domain.ColumnTypeBoolean:
		return "boolean"
	case domain.ColumnTypeCurrency:
		return "numeric"
	case domain.ColumnTypeLink:
		return "text"
	default:
		return "text"
	}
}

func parseToPostgresValue(v any) string {
	switch val := v.(type) {
	case string:
		return fmt.Sprintf("%v", val)
	case int:
		return fmt.Sprintf("%d", val)
	case bool:
		return fmt.Sprintf("%t", val)
	case pgtype.Time:
		ms := val.Microseconds
		return fmt.Sprintf(`'%v'::time`, time.Unix(0, ms*1000))
	case time.Time:
		return fmt.Sprintf(`'%v'::date`, val.Format("2006-01-02"))
	case decimal.Decimal:
		return fmt.Sprintf(`'%v'::numeric`, val)
	default:
		return fmt.Sprintf("'%s'", val)
	}
}

func (uc *UpdateRowUseCase) ExecuteV2(
	ctx shared.RequestContext,
	projectId string,
	tableId string,
	input *domain.UpdateRowRequestV2,
) error {

	c := ctx.GetContext()

	// Get a connection pool of the database
	connPool, err := uc.Pgx.GetOrCreatePgxPool(shared.GenerateDatabaseName(projectId, ctx.GetUserId()))
	if err != nil {
		uc.Logger.Debugf("error getting pgx pool: %v", err)
		return err
	}

	// input.Data is a []map[string]any

	return connPool.ExecuteTransaction(
		c,
		func(cc context.Context, tx v5.Tx) error {

			table, err := connPool.LookupTableInfo(cc, tableId)
			if err != nil {
				uc.Logger.Debugf("error looking up table info: %v", err)
				return err
			}

			updateData := input.Data

			for _, row := range updateData {
				id, ok := row["id"]
				if !ok {
					return fmt.Errorf("id column not found")
				}

				idStr := fmt.Sprintf("%v", id)

				// cast id to int, this is the parent id we use to get the link data
				rowId, err := strconv.Atoi(idStr)
				if err != nil {
					return fmt.Errorf("id is not an integer")
				}

				for _, col := range table.Columns {
					if _, ok := row[col.Name]; !ok {
						continue
					}

					if col.Type == domain.ColumnTypePrimaryKey {
						continue
					}

					if col.Type == domain.ColumnTypeLink {
						childIds, err := uc.parseLinkValue(row[col.Name].(string))
						if err != nil {
							uc.Logger.Debugf("error parsing link value: %v", err)
							return err
						}

						err = connPool.UpdateLinkColumn(cc, table.Name, col.Id, rowId, childIds)
						if err != nil {
							uc.Logger.Debugf("error updating link column: %v", err)
							return err
						}
					} else {
						err = connPool.UpdateDataColumn(cc, table.Name, col, rowId, row[col.Name])
						if err != nil {
							uc.Logger.Debugf("error updating data column: %v", err)
							return err
						}
					}
				}
			}

			return nil
		},
	)

}

func (uc *UpdateRowUseCase) parseLinkValue(v string) ([]int, error) {
	var linkIds []int
	err := json.Unmarshal([]byte(v), &linkIds)
	if err != nil {
		uc.Logger.Errorf("error unmarshalling linked column ids: %v", err)
		return nil, err
	}

	uc.Logger.Debugf("link ids: %v", linkIds)

	return linkIds, nil
}
