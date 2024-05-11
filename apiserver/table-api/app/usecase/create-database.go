package usecase

import (
	"context"
	"fmt"
	"yalc/dbms/domain"
	"yalc/dbms/modules/config"
	"yalc/dbms/modules/logger"
	neonclient "yalc/dbms/modules/neon-client"
	"yalc/dbms/modules/pgx"
	"yalc/dbms/shared"

	v5 "github.com/jackc/pgx/v5"

	"go.uber.org/fx"
)

type (
	CreateDatabaseUseCase struct {
		Config *config.Config
		Logger logger.Logger

		*neonclient.NeonClient
		*pgx.PgxManager
	}

	CreateDatabaseUseCaseParams struct {
		fx.In

		Config *config.Config
		Logger logger.Logger

		*neonclient.NeonClient
		*pgx.PgxManager
	}
)

func NewCreateDatabaseUseCase(p CreateDatabaseUseCaseParams) *CreateDatabaseUseCase {
	return &CreateDatabaseUseCase{
		Config:     p.Config,
		Logger:     p.Logger,
		NeonClient: p.NeonClient,
		PgxManager: p.PgxManager,
	}
}

func (uc *CreateDatabaseUseCase) Execute(ctx shared.RequestContext, projectId string) error {

	c := ctx.GetContext()

	// check if database is already created
	// if it is, return an error
	// if not, create the database
	resp, err := uc.NeonClient.GetDatabaseDetails(shared.GenerateDatabaseName(projectId, ctx.GetUserId()))
	if err == nil {
		if resp.StatusCode == 200 {
			return fmt.Errorf("database already exists")
		}
	}

	err = uc.NeonClient.CreateDatabase(shared.GenerateDatabaseName(projectId, ctx.GetUserId()))
	if err != nil {
		uc.Logger.Debugf("error creating database: %v", err)
		return err
	}

	// wait for the database to be created
	err = uc.NeonClient.WaitForDatabase(shared.GenerateDatabaseName(projectId, ctx.GetUserId()))
	if err != nil {
		uc.Logger.Debugf("error waiting for database: %v", err)
		return err
	}
	// insert project level tables into the database
	connPool, err := uc.GetOrCreatePgxPool(shared.GenerateDatabaseName(projectId, ctx.GetUserId()))
	if err != nil {
		uc.Logger.Debugf("error getting pgx pool: %v", err)
		return err
	}

	return connPool.ExecuteTransaction(c, func(cc context.Context, tx v5.Tx) error {

		_, ok := cc.Value(pgx.TxCtx{}).(v5.Tx)
		if !ok {
			return fmt.Errorf("transaction context not found")
		}

		// table: `yalc_tables`
		//uc.Logger.Debug("ctx: %v", cc)
		_, err = connPool.CreateDefaultTable(cc, &domain.Table{
			Name: "yalc_tables",
			TID:  shared.GenerateTableId(),
			Columns: []domain.Column{

				{
					Name:  "table_id",
					Label: "table id",
					Type:  domain.ColumnTypeString,
				},
				{
					Name:  "table_name",
					Label: "table name",
					Type:  domain.ColumnTypeString,
				},
				{
					Name:  "table_title",
					Label: "table title",
					Type:  domain.ColumnTypeString,
				},
				{
					Name:  "mm",
					Label: "mm",
					Type:  domain.ColumnTypeBoolean,
				},
			},
		})

		if err != nil {
			uc.Logger.Debug("error creating table yalc_tables: %v", err)
			return err
		}

		// table: `yalc_cols`
		_, err = connPool.CreateDefaultTable(cc, &domain.Table{
			Name: "yalc_cols",
			TID:  shared.GenerateTableId(),
			Columns: []domain.Column{

				{
					Name:  "table_id",
					Label: "table id",
					Type:  domain.ColumnTypeString,
				},
				{
					Name:  "col_id",
					Label: "col id",
					Type:  domain.ColumnTypeString,
				},
				{
					Name:  "col_name",
					Label: "col name",
					Type:  domain.ColumnTypeString,
				},
				{
					Name:  "col_title",
					Label: "col title",
					Type:  domain.ColumnTypeString,
				},
				{
					Name:  "type",
					Label: "type",
					Type:  domain.ColumnTypeString,
				},
			},
		})

		if err != nil {
			uc.Logger.Debug("error creating table yalc_cols: %v", err)
			return err
		}

		// table: `yalc_col_relations`
		_, err = connPool.CreateDefaultTable(cc, &domain.Table{
			Name: "yalc_col_relations",
			TID:  shared.GenerateTableId(),
			Columns: []domain.Column{

				{
					Name:  "link_col_id",
					Label: "link col id",
					Type:  domain.ColumnTypeString,
				},
				{
					Name:  "link_table_id",
					Label: "link table id",
					Type:  domain.ColumnTypeString,
				},
				{
					Name:  "fk_child_col_id",
					Label: "fk child col id",
					Type:  domain.ColumnTypeString,
				},
				{
					Name:  "fk_parent_col_id",
					Label: "fk parent col id",
					Type:  domain.ColumnTypeString,
				},
				{
					Name:  "mm_table_id",
					Label: "mm table id",
					Type:  domain.ColumnTypeString,
				},
				{
					Name:  "fk_mm_child_col_id",
					Label: "fk mm child col id",
					Type:  domain.ColumnTypeString,
				},
				{
					Name:  "fk_mm_parent_col_id",
					Label: "fk mm parent col id",
					Type:  domain.ColumnTypeString,
				},
			},
		})

		if err != nil {
			uc.Logger.Debug("error creating table yalc_col_relations: %v", err)
			return err
		}

		return nil

	})

}
