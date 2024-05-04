package usecase

import (
	"fmt"
	"strings"
	"yalc/dbms/domain"
	"yalc/dbms/modules/config"
	"yalc/dbms/modules/logger"
	"yalc/dbms/modules/pgx"
	"yalc/dbms/shared"

	"go.uber.org/fx"
)

type (
	CreateColumnUseCase struct {
		Config *config.Config
		Logger logger.Logger

		Pgx *pgx.PgxManager
	}

	CreateColumnUseCaseParams struct {
		fx.In

		Config *config.Config
		Logger logger.Logger

		Pgx *pgx.PgxManager
	}
)

func NewCreateColumnUseCase(p CreateColumnUseCaseParams) *CreateColumnUseCase {
	return &CreateColumnUseCase{
		Config: p.Config,
		Logger: p.Logger,
		Pgx:    p.Pgx,
	}
}

func (uc *CreateColumnUseCase) Execute(
	ctx shared.RequestContext,
	projectId string,
	tableId string,
	data *domain.CreateColumnRequest,
) (*domain.Table, error) {

	c := ctx.GetContext()

	// get the table definition
	userDbPool, err := uc.Pgx.GetOrCreateUserPgxPool()
	if err != nil {
		uc.Logger.Debugf("error getting user pgx pool: %v", err)
		return nil, err
	}

	userTx, err := userDbPool.Begin(c)
	if err != nil {
		uc.Logger.Debugf("error beginning transaction: %v", err)
		return nil, err
	}

	defer userDbPool.Rollback(userTx)

	table, err := userDbPool.GetTableInfo(userTx, tableId)
	if err != nil {
		uc.Logger.Debugf("error getting table info: %v", err)
		return nil, err
	}

	// create ADD COLUMN statements
	newColumns := make([]domain.Column, len(data.Columns))
	newColumnsQuery := make([]string, len(data.Columns))
	for i, col := range data.Columns {
		newColumns[i] = domain.Column{
			Name: col.Name,
			Type: col.Type,
			Id:   shared.GenerateColumnId(),
		}

		newColumnsQuery[i] = "ADD COLUMN \"" + newColumns[i].Id + "\" " + shared.ColumnToPostgresType(&col.Type)
	}

	uc.Logger.Debugf("new columns: %v", newColumns)

	sql := `ALTER TABLE "%s" %s;`

	uc.Logger.Debugf("creating column: %s", fmt.Sprintf(sql, table.Name, strings.Join(newColumnsQuery, ", ")))

	// Get a connection pool of the database
	connPool, err := uc.Pgx.GetOrCreatePgxPool(shared.GenerateDatabaseName(projectId, ctx.GetUserId()))
	if err != nil {
		uc.Logger.Debugf("error getting pgx pool: %v", err)
		return nil, err
	}

	connTx, err := connPool.Begin(c)
	if err != nil {
		uc.Logger.Debugf("error beginning transaction: %v", err)
		return nil, err
	}

	defer connPool.Rollback(connTx)

	// execute the query
	_, err = connPool.ConnPool.Query(connTx, fmt.Sprintf(sql, table.Name, strings.Join(newColumnsQuery, ", ")))
	if err != nil {
		uc.Logger.Debugf("error executing query: %v", err)
		return nil, err
	}

	// update the table metadata
	table.Columns = append(table.Columns, newColumns...)
	err = userDbPool.UpdateTableInfo(userTx, tableId, table)
	if err != nil {
		uc.Logger.Debugf("error updating table info: %v", err)
		return nil, err
	}

	// commit the transaction
	connPool.Commit(connTx)
	userDbPool.Commit(userTx)

	return table, nil
}
