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
	DeleteColumnUseCase struct {
		Config *config.Config
		Logger logger.Logger

		Pgx *pgx.PgxManager
	}

	DeleteColumnUseCaseParams struct {
		fx.In

		Config *config.Config
		Logger logger.Logger

		Pgx *pgx.PgxManager
	}
)

func NewDeleteColumnUseCase(p DeleteColumnUseCaseParams) *DeleteColumnUseCase {
	return &DeleteColumnUseCase{
		Config: p.Config,
		Logger: p.Logger,
		Pgx:    p.Pgx,
	}
}

func (uc *DeleteColumnUseCase) Execute(
	ctx shared.RequestContext,
	projectId string,
	tableId string,
	data *domain.DeleteColumnRequest,
) error {

	c := ctx.GetContext()

	// get the table definition
	userDbPool, err := uc.Pgx.GetOrCreateUserPgxPool()
	if err != nil {
		uc.Logger.Debugf("error getting user pgx pool: %v", err)
		return err
	}

	return userDbPool.ExecTx(c, func(udpp *pgx.UserDbPgxPool) error {

		table, err := userDbPool.GetTableInfo(c, tableId)
		if err != nil {
			uc.Logger.Debugf("error getting table info: %v", err)
			return err
		}

		sql := `ALTER TABLE "%s" %s`

		deleteColumnsQuery := make([]string, len(data.ColumnIds))
		for i, columnId := range data.ColumnIds {
			// drop column
			deleteColumnsQuery[i] = `DROP COLUMN "` + columnId + `"`

			if i < len(data.ColumnIds)-1 {
				deleteColumnsQuery[i] += ","
			}
		}

		uc.Logger.Debugf("delete columns: %v", deleteColumnsQuery)

		// Get a connection pool of the database
		connPool, err := uc.Pgx.GetOrCreatePgxPool(shared.GenerateDatabaseName(projectId, ctx.GetUserId()))
		if err != nil {
			uc.Logger.Debugf("error getting pgx pool: %v", err)
			return err
		}

		return connPool.ExecTx(c, func(p *pgx.Pgx) error {
			_, err := p.ConnPool.Exec(c, fmt.Sprintf(sql, table.Name, strings.Join(deleteColumnsQuery, ", ")))
			if err != nil {
				uc.Logger.Debugf("error deleting column: %v", err)
				return err
			}

			// update table definition
			uc.Logger.Debug("updating table definition: ", table, data)

			// create a deep copy of the table
			updatedTable := *table

			updatedTable.Columns = make([]domain.Column, 0, len(table.Columns))
			for _, col := range table.Columns {
				if !shared.InSlice(col.Id, data.ColumnIds) {
					updatedTable.Columns = append(updatedTable.Columns, col)
				}
			}

			// update table metadata
			uc.Logger.Debugf("updated table: %v", updatedTable)
			err = userDbPool.UpdateTableInfo(c, tableId, &updatedTable)
			if err != nil {
				uc.Logger.Debugf("error updating table info: %v", err)
				return err
			}

			return nil
		})
	})
}
