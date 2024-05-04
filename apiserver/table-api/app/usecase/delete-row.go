package usecase

import (
	"fmt"
	"strconv"
	"yalc/dbms/domain"
	"yalc/dbms/modules/config"
	"yalc/dbms/modules/logger"
	"yalc/dbms/modules/pgx"
	"yalc/dbms/shared"

	"go.uber.org/fx"
)

type (
	DeleteRowUseCase struct {
		Config *config.Config
		Logger logger.Logger

		Pgx *pgx.PgxManager
	}

	DeleteRowUseCaseParams struct {
		fx.In

		Config *config.Config
		Logger logger.Logger

		Pgx *pgx.PgxManager
	}
)

func NewDeleteRowUseCase(p DeleteRowUseCaseParams) *DeleteRowUseCase {
	return &DeleteRowUseCase{
		Config: p.Config,
		Logger: p.Logger,
		Pgx:    p.Pgx,
	}
}

func (uc *DeleteRowUseCase) Execute(
	ctx shared.RequestContext,
	projectId string,
	tableId string,
	req *domain.DeleteRowRequest,
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

	sql := `DELETE FROM "%s" WHERE id IN (%s);`

	// build the where clause
	whereClause := ""
	for i, id := range req.RowIds {
		if i > 0 {
			whereClause += ","
		}
		whereClause += strconv.Itoa(id)
	}

	uc.Logger.Debugf("sql: %s", fmt.Sprintf(sql, table.Name, whereClause))

	// get a connection pool of the database
	connPool, err := uc.Pgx.GetOrCreatePgxPool(shared.GenerateDatabaseName(projectId, ctx.GetUserId()))
	if err != nil {
		uc.Logger.Debugf("error getting pgx pool: %v", err)
		return fmt.Errorf("error getting pgx pool: %v", err)
	}

	connPool.ExecTx(c, func(p *pgx.Pgx) error {
		_, err := p.ConnPool.Query(c, fmt.Sprintf(sql, table.Name, whereClause))
		if err != nil {
			uc.Logger.Debugf("error deleting rows: %v", err)
			return err
		}

		return nil
	})

	return nil

}
