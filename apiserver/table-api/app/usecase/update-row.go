package usecase

import (
	"fmt"
	"strings"
	"yalc/dbms/domain"
	"yalc/dbms/modules/config"
	"yalc/dbms/modules/logger"
	"yalc/dbms/modules/pgx"
	"yalc/dbms/shared"

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
				quotedValues[j] = fmt.Sprintf("%v", parsedVal)
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

	connPool.ExecTx(c, func(p *pgx.Pgx) error {
		tag, err := p.ConnPool.Exec(c, sql)
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

	return nil
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
