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
	GetTableInfoUseCase struct {
		Config *config.Config
		Logger logger.Logger

		Pgx *pgx.PgxManager
	}

	GetTableInfoUseCaseParams struct {
		fx.In

		Config *config.Config
		Logger logger.Logger

		Pgx *pgx.PgxManager
	}
)

func NewGetTableInfoUseCase(p GetTableInfoUseCaseParams) *GetTableInfoUseCase {
	return &GetTableInfoUseCase{
		Config: p.Config,
		Logger: p.Logger,
		Pgx:    p.Pgx,
	}
}

func (uc *GetTableInfoUseCase) Execute(
	c shared.RequestContext,
	projectId string,
	tableId string,
) (*domain.Table, error) {

	connPool, err := uc.Pgx.GetOrCreatePgxPool(shared.GenerateDatabaseName(projectId, c.GetUserId()))
	if err != nil {
		return nil, err
	}

	table, err := connPool.LookupTableInfo(c.GetContext(), tableId)
	if err != nil {
		uc.Logger.Debug("error getting table info: %v", err)
		return nil, err
	}

	return table, err
}
