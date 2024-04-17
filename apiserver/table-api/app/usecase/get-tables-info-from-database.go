package usecase

import (
	"fmt"
	"yalc/dbms/modules/config"
	"yalc/dbms/modules/logger"
	"yalc/dbms/modules/pgx"
	"yalc/dbms/shared"

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

func (uc *GetTablesInfoFromDatabaseUseCase) Execute(c shared.RequestContext, projectId string) (interface{}, error) {
	// get user id from claims
	userId := c.GetUserId()

	db := fmt.Sprintf("%s_%s", userId, projectId)

	// try to get a conn from pool cache
	connPool, ok := uc.Pgx.ConnPoolMap.Get(db)
	// if conn pool doesn't exist, create a new one
	if !ok {
		_, err := uc.Pgx.NewPgxPool(db)
		if err != nil {
			return nil, err
		}
	}

	// get the conn pool from cache
	connPool, _ = uc.Pgx.ConnPoolMap.Get(db)

	// acquire a connection from the pool
	ctx := c.GetContext()
	conn, err := connPool.AcquireConn(ctx)
	if err != nil {
		return nil, err
	}

	// release the connection back to the pool
	defer connPool.ReleaseConn(conn)

	// get the tables info from the database
	tables, err := conn.GetTablesInfo(ctx)

	return tables, err
}
