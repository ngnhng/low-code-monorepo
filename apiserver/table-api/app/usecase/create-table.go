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
	CreateTableUseCase struct {
		Config *config.Config
		Logger logger.Logger

		Pgx *pgx.PgxManager
	}

	CreateTableUseCaseParams struct {
		fx.In

		Config *config.Config
		Logger logger.Logger

		Pgx *pgx.PgxManager
	}
)

func NewCreateTableUseCase(p CreateTableUseCaseParams) *CreateTableUseCase {
	return &CreateTableUseCase{
		Config: p.Config,
		Logger: p.Logger,
		Pgx:    p.Pgx,
	}
}

func (uc *CreateTableUseCase) Execute(
	ctx shared.RequestContext,
	projectId string,
	tableDef *domain.Table,
) (*domain.Table, error) {

	c := ctx.GetContext()

	// try to get a conn from pool cache
	connPool, err := uc.Pgx.GetOrCreatePgxPool(shared.GenerateDatabaseName(projectId, ctx.GetUserId()))
	if err != nil {
		uc.Logger.Debugf("error getting pgx pool: %v", err)
		return nil, err
	}

	table := &domain.Table{}

	err = connPool.ExecuteTransaction(c, func(cc context.Context, tx v5.Tx) error {

		//tid := shared.GenerateTableId()

		//tableName := shared.GenerateTableName(tableDef.Label)

		table = &domain.Table{
			//TID:     tid,
			//Name:    shared.NormalizeStringForPostgres(tableDef.Label),
			Label:   tableDef.Label,
			Columns: tableDef.Columns,
		}

		// create table -- also contain id column
		createdTable, err := connPool.CreateTableV2(cc, table)
		if err != nil {
			uc.Logger.Debugf("error creating table: %v", err)
			return err
		}

		// we insert data to manager tables (yalc_tables, yalc_columns)
		err = connPool.InsertToYALCTables(
			cc,
			createdTable.TID,
			createdTable.Name,
			createdTable.Label,
			false, // not a m2m link table
		)
		if err != nil {
			uc.Logger.Debugf("error inserting to yalc_tables: %v", err)
			return err
		}

		for _, col := range createdTable.Columns {
			err := connPool.InsertToYALCCols(
				cc,
				createdTable.TID,
				col.Id,
				col.Name,
				col.Label,
				col.Type,
			)
			if err != nil {
				uc.Logger.Debugf("error inserting to yalc_cols: %v", err)
				return err
			}
		}

		table = createdTable

		return nil
	})

	return table, err
}
