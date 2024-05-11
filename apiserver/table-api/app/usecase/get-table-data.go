package usecase

import (
	"context"
	"fmt"
	"strconv"
	"strings"
	"yalc/dbms/domain"
	"yalc/dbms/modules/config"
	"yalc/dbms/modules/logger"
	"yalc/dbms/modules/pgx"
	"yalc/dbms/shared"

	v5 "github.com/jackc/pgx/v5"

	"go.uber.org/fx"
)

type (
	GetTableDataUseCase struct {
		Config *config.Config
		Logger logger.Logger

		Pgx *pgx.PgxManager
	}

	GetTableDataUseCaseParams struct {
		fx.In

		Config *config.Config
		Logger logger.Logger
		Pgx    *pgx.PgxManager
	}

	ColumnLabelMap map[string]string
)

func NewGetTableDataUseCase(p GetTableDataUseCaseParams) *GetTableDataUseCase {
	return &GetTableDataUseCase{
		Config: p.Config,
		Logger: p.Logger,
		Pgx:    p.Pgx,
	}
}

func (uc *GetTableDataUseCase) Execute(
	ctx shared.RequestContext,
	projectId,
	tableId string,
	query *domain.Query,
	limit,
	offset int,
) (*domain.GetTableDataResponse, error) {

	c := ctx.GetContext()

	// Get a connection pool of the user database
	userDbPool, err := uc.Pgx.GetOrCreateUserPgxPool()
	if err != nil {
		return nil, err
	}

	// Get table info
	table, err := userDbPool.GetTableInfo(c, tableId)
	if err != nil {
		uc.Logger.Debugf("error getting table info: %v", err)
		return nil, err
	}

	// Get a connection pool of the project database
	connPool, err := uc.Pgx.GetOrCreatePgxPool(shared.GenerateDatabaseName(projectId, ctx.GetUserId()))
	if err != nil {
		return nil, err
	}

	// Get table data
	//tableData, err := connPool.GetTableData(c, tableId, limit, offset)
	//if err != nil {
	//	uc.Logger.Debugf("error getting table data: %v", err)
	//	return nil, err
	//}

	result := &domain.GetTableDataResponse{
		Columns: make([]domain.Column, 0),
		Rows:    make([][]string, 0),
	}

	err = connPool.ExecuteTransaction(c, func(cc context.Context, tx v5.Tx) error {
		tableData, err := connPool.GetTableData(cc, table.Name, query, limit, offset)
		if err != nil {
			return err
		}

		result = tableData

		return nil
	})

	// Create a map to store column names and IDs
	colDataMap := make(map[string]string)
	for _, colData := range table.Columns {
		colDataMap[colData.Id] = colData.Name
	}

	// Assign IDs to result columns
	for _, col := range result.Columns {
		if name, ok := colDataMap[col.Id]; ok {
			col.Name = name
		}
	}

	//	//if i == 0 {
	//	//	result.Columns[i].IsPrimaryKey = true
	//	//}
	//}

	return result, err
}

func (uc *GetTableDataUseCase) ExecuteV2(
	ctx shared.RequestContext,
	projectId,
	tableId string,
	query *domain.Query,
	limit,
	offset int,
) (*domain.GetTableDataResponseV2, error) {

	c := ctx.GetContext()

	connPool, err := uc.Pgx.GetOrCreatePgxPool(shared.GenerateDatabaseName(projectId, ctx.GetUserId()))
	if err != nil {
		return nil, err
	}

	result := &domain.GetTableDataResponseV2{
		Data: make([]map[string]interface{}, 0),
		PageInfo: domain.PageInfo{
			TotalCount: 0,
		},
	}

	// Replace ? placeholders with $1, $2, etc.
	sqlQuery := query.Sql
	for i := range query.Params {
		placeholder := fmt.Sprintf("$%d", i+1)
		sqlQuery = strings.Replace(sqlQuery, "?", placeholder, 1)
	}
	params := query.Params // {}interface[]

	uc.Logger.Debugf("sqlQuery: %s", sqlQuery)
	uc.Logger.Debugf("params: %v", params)

	err = connPool.ExecuteTransaction(
		c,
		func(cc context.Context, tx v5.Tx) error {

			table, err := connPool.LookupTableInfo(cc, tableId)
			if err != nil {
				uc.Logger.Debugf("error looking up table info: %v", err)
				return err
			}

			dataColumns := make([]domain.Column, 0)
			linkColumns := make([]domain.Column, 0)

			for _, col := range table.Columns {
				if col.Type == domain.ColumnTypeLink {
					linkColumns = append(linkColumns, col)
				} else {
					dataColumns = append(dataColumns, col)
				}
			}

			// Get data from data columns
			sql := `SELECT * FROM "%s" WHERE %s LIMIT %d OFFSET %d`
			sqlFetchQuery := fmt.Sprintf(sql, table.Name, sqlQuery, limit, offset)

			rows, err := tx.Query(cc, sqlFetchQuery, params...)
			if err != nil {
				uc.Logger.Debugf("error executing query: %v", err)
				return err
			}

			defer rows.Close()

			columns := make([]string, 0)
			for _, fd := range rows.FieldDescriptions() {
				columns = append(columns, string(fd.Name))
			}

			// Initialize a slice to hold the result rows
			resultRows := make([]map[string]interface{}, 0)

			for rows.Next() {
				row := make([]interface{}, len(columns))
				rowPtrs := make([]interface{}, len(row))
				for i := range row {
					rowPtrs[i] = &row[i]
				}
				err = rows.Scan(rowPtrs...)
				if err != nil {
					uc.Logger.Debugf("error scanning row: %v", err)
					return err
				}

				// Create a map for the row
				rowMap := make(map[string]interface{})
				for i, colName := range columns {
					var v interface{}
					val := row[i]
					b, ok := val.([]byte)
					if ok {
						v = string(b)
					} else {
						v = val
					}
					rowMap[colName] = v
				}

				// Add the row map to the result rows
				resultRows = append(resultRows, rowMap)
			}

			uc.Logger.Debugf("resultRows: %v", resultRows)

			// iterate through each object
			if len(linkColumns) != 0 {
				for _, row := range resultRows {
					id, ok := row["id"]
					if !ok {
						return fmt.Errorf("id column not found")
					}

					idStr := fmt.Sprintf("%v", id)

					// cast id to int, this is the parent id we use to get the link data
					idInt, err := strconv.Atoi(idStr)
					if err != nil {
						return fmt.Errorf("id is not an integer")
					}

					// get the link data
					for _, linkCol := range linkColumns {
						// get the link data
						linkData, err := connPool.GetLinkColumnData(cc, linkCol, idInt)
						if err != nil {
							uc.Logger.Debugf("error getting link data: %v", err)
							return err
						}

						// add the link data to the row
						row[linkCol.Name] = linkData
					}
				}
			}

			result.Data = resultRows

			// Get the total count
			sql = `SELECT COUNT(*) FROM "%s" WHERE %s`
			sqlTotalQuery := fmt.Sprintf(sql, table.Name, sqlQuery)
			err = tx.QueryRow(cc, sqlTotalQuery, query.Params...).Scan(&result.PageInfo.TotalCount)
			if err != nil {
				uc.Logger.Debugf("error getting total count: %v", err)
				return err
			}

			return nil
		},
	)

	return result, err

}
