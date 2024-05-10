package usecase

import (
	"context"
	"fmt"
	"yalc/dbms/modules/config"
	"yalc/dbms/modules/logger"
	"yalc/dbms/modules/pgx"
	"yalc/dbms/shared"

	v5 "github.com/jackc/pgx/v5"

	"go.uber.org/fx"
)

type (
	DeleteTableUseCase struct {
		Config *config.Config
		Logger logger.Logger

		Pgx *pgx.PgxManager
	}

	DeleteTableUseCaseParams struct {
		fx.In

		Config *config.Config
		Logger logger.Logger

		Pgx *pgx.PgxManager
	}
)

func NewDeleteTableUseCase(p DeleteTableUseCaseParams) *DeleteTableUseCase {
	return &DeleteTableUseCase{
		Config: p.Config,
		Logger: p.Logger,
		Pgx:    p.Pgx,
	}
}

func (uc *DeleteTableUseCase) Execute(
	ctx shared.RequestContext,
	projectId string,
	tableId string,
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

	connPool, err := uc.Pgx.GetOrCreatePgxPool(shared.GenerateDatabaseName(projectId, ctx.GetUserId()))
	if err != nil {
		uc.Logger.Debugf("error getting pgx pool: %v", err)
		return err
	}

	return userDbPool.ExecuteTransaction(c, func(ucc context.Context, uTx v5.Tx) error {

		return connPool.ExecuteTransaction(ucc, func(ccc context.Context, connTx v5.Tx) error {
			// drop the table
			_, err := connTx.Exec(ccc, fmt.Sprintf(`DROP TABLE "%s"`, table.Name))
			if err != nil {
				uc.Logger.Debugf("error dropping table: %v", err)
				return err
			}

			// delete the table
			sql := `DELETE FROM "Table" WHERE "tid" = $1`
			_, err = uTx.Exec(ucc, sql, tableId)
			if err != nil {
				uc.Logger.Debugf("error deleting table: %v", err)
				return err
			}

			return nil
		})

	})
}
