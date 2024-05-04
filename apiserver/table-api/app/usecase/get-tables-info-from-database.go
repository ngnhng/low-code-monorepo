package usecase

import (
	"yalc/dbms/domain"
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
