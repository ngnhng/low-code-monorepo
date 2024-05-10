package usecase

import (
	"context"
	"yalc/dbms/domain"
	"yalc/dbms/modules/config"
	"yalc/dbms/modules/logger"
	"yalc/dbms/modules/pgx"
	"yalc/dbms/shared"

	v5 "github.com/jackc/pgx/v5"

	"go.uber.org/fx"
)

type (
	GetTablesInfoFromDatabaseUseCase struct {
		Config *config.Config
		Logger logger.Logger

		Pgx *pgx.PgxManager
	}

	GetTablesInfoFromDatabaseUseCaseParams struct {
		fx.In

		Config *config.Config
		Logger logger.Logger
		Pgx    *pgx.PgxManager
	}
)

func NewGetTablesInfoFromDatabaseUseCase(p GetTablesInfoFromDatabaseUseCaseParams) *GetTablesInfoFromDatabaseUseCase {
	return &GetTablesInfoFromDatabaseUseCase{
		Config: p.Config,
		Logger: p.Logger,
		Pgx:    p.Pgx,
	}
}

func (uc *GetTablesInfoFromDatabaseUseCase) Execute(c shared.RequestContext, projectId string) ([]*domain.Table, error) {

	// Get a connection pool of the user database
	connPool, err := uc.Pgx.GetOrCreateUserPgxPool()
	if err != nil {
		return nil, err
	}

	tables, err := connPool.GetTablesInfo(c.GetContext(), projectId)
	if err != nil {
		uc.Logger.Debug("error getting tables info: %v", err)
		return nil, err
	}

	return tables, err
}

func (uc *GetTablesInfoFromDatabaseUseCase) ExecuteV2(ctx shared.RequestContext, projectId string) ([]*domain.Table, error) {

	c := ctx.GetContext()

	// Get a connection pool of the database
	connPool, err := uc.Pgx.GetOrCreatePgxPool(shared.GenerateDatabaseName(projectId, ctx.GetUserId()))
	if err != nil {
		uc.Logger.Debugf("error getting pgx pool: %v", err)
		return nil, err
	}

	sql := ` SELECT 
    	yalc_tables.table_id, 
   		yalc_tables.table_name, 
    	yalc_tables.table_title, 
    	yalc_cols.col_id, 
    	yalc_cols.col_name, 
		yalc_cols.col_title,
    	yalc_cols.type
			FROM	 
    	yalc_tables 
			JOIN 
    	yalc_cols ON yalc_tables.table_id = yalc_cols.table_id AND yalc_tables.mm = FALSE;
	`

	result := make([]*domain.Table, 0)

	err = connPool.ExecuteTransaction(
		c,
		func(cc context.Context, tx v5.Tx) error {

			rows, err := tx.Query(cc, sql)
			if err != nil {
				return err
			}

			defer rows.Close()

			tableMap := make(map[string]*domain.Table)
			for rows.Next() {
				var (
					tableId     string
					tableName   string
					tableTitle  string
					columnId    string
					columnName  string
					columnTitle string
					columnType  string
				)
				if err := rows.Scan(&tableId, &tableName, &tableTitle, &columnId, &columnName, &columnTitle, &columnType); err != nil {
					return err
				}

				// If the table is not in the map, create it and add it to the map
				if _, ok := tableMap[tableId]; !ok {
					tableMap[tableId] = &domain.Table{
						TID:   tableId,
						Name:  tableName,
						Label: tableTitle,
						Columns: []domain.Column{
							{
								Id:    columnId,
								Name:  columnName,
								Label: columnTitle,
								Type:  domain.ColumnType(columnType),
							},
						},
					}
				} else {
					// If the table is already in the map, just append the new column to it
					tableMap[tableId].Columns = append(tableMap[tableId].Columns, domain.Column{
						Id:    columnId,
						Name:  columnName,
						Label: columnTitle,
						Type:  domain.ColumnType(columnType),
					})
				}
			}

			// Convert the map to a slice
			for _, table := range tableMap {
				result = append(result, table)
			}

			return nil

		},
	)

	return result, err

}
