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
	// Get user id from claims
	userId := c.GetUserId()

	// Format the database name
	db := fmt.Sprintf("%s_%s", userId, projectId)

	// Get a connection pool of the database
	connPool, err := uc.getConnPool(db)
	if err != nil {
		return nil, err
	}

	ctx := c.GetContext()
	tables, err := connPool.GetTablesInfo(ctx)

	return tables, err
}

func (uc *GetTablesInfoFromDatabaseUseCase) getConnPool(db string) (*pgx.Pgx, error) {
	// Try to get a conn from pool cache
	connPool, err := uc.Pgx.GetPgxPool(db)
	if err != nil {
		uc.Logger.Debugf("conn pool not found in cache, creating a new one for db: %s", db)
		// Create a new conn pool
		connPool, err = uc.Pgx.NewPgxPool(db)
		if err != nil {
			uc.Logger.Errorf("failed to create a new conn pool for db: %s", db)
			return nil, err
		}
		uc.Logger.Debugf("new conn pool created for db: %s", db)
	}

	return connPool, nil
}
