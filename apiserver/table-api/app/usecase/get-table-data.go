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
	GetTableDataUseCase struct {
		Config *config.Config
		Logger logger.Logger

		Pgx *pgx.PgxManager
	}

	GetTableDataUseCaseParams struct {
		fx.In

		Config *config.Config
		Logger logger.Logger
		Pgx    *pgx.PgxManager
	}

	ColumnLabelMap map[string]string
)

func NewGetTableDataUseCase(p GetTableDataUseCaseParams) *GetTableDataUseCase {
	return &GetTableDataUseCase{
		Config: p.Config,
		Logger: p.Logger,
		Pgx:    p.Pgx,
	}
}

func (uc *GetTableDataUseCase) Execute(
	ctx shared.RequestContext,
	projectId,
	tableId string,
	query *domain.Query,
	limit,
	offset int,
) (*domain.GetTableDataResponse, error) {

	c := ctx.GetContext()

	// Get a connection pool of the user database
	userDbPool, err := uc.Pgx.GetOrCreateUserPgxPool()
	if err != nil {
		return nil, err
	}

	// Get table info
	table, err := userDbPool.GetTableInfo(c, tableId)
	if err != nil {
		uc.Logger.Debugf("error getting table info: %v", err)
		return nil, err
	}

	// Get a connection pool of the project database
	connPool, err := uc.Pgx.GetOrCreatePgxPool(shared.GenerateDatabaseName(projectId, ctx.GetUserId()))
	if err != nil {
		return nil, err
	}

	// Get table data
	//tableData, err := connPool.GetTableData(c, tableId, limit, offset)
	//if err != nil {
	//	uc.Logger.Debugf("error getting table data: %v", err)
	//	return nil, err
	//}

	result := &domain.GetTableDataResponse{
		Columns: make([]domain.Column, 0),
		Rows:    make([][]string, 0),
	}

	err = connPool.ExecTx(c, func(p *pgx.Pgx) error {
		tableData, err := p.GetTableData(c, table.Name, query, limit, offset)
		if err != nil {
			return err
		}

		result = tableData

		return nil
	})

	//// parse the columns to result
	//for _, col := range table.Columns {
	//	result.Columns = append(result.Columns, domain.Column{
	//		Id:   col.Id,
	//		Name: col.Name,
	//		Type: col.Type,
	//	})

	//	//if i == 0 {
	//	//	result.Columns[i].IsPrimaryKey = true
	//	//}
	//}

	return result, err
}
