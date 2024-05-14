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
	ctx shared.RequestContext,
	projectId string,
	tableId string,
) (*domain.Table, error) {

	c := ctx.GetContext()

	connPool, err := uc.Pgx.GetOrCreatePgxPool(shared.GenerateDatabaseName(projectId, ctx.GetUserId()))
	if err != nil {
		return nil, err
	}

	//table, err := connPool.LookupTableInfo(c.GetContext(), tableId)
	//if err != nil {
	//	uc.Logger.Debug("error getting table info: %v", err)
	//	return nil, err
	//}

	var table *domain.Table

	connPool.ExecuteTransaction(c, func(cc context.Context, tx v5.Tx) error {
		table, err = connPool.LookupTableInfo(cc, tableId)
		if err != nil {
			uc.Logger.Debug("error getting table info: %v", err)
			return err
		}
		return nil
	})

	return table, err
}
