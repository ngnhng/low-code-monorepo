package usecase

import (
	"context"
	"fmt"
	"strconv"
	"yalc/dbms/domain"
	"yalc/dbms/modules/config"
	"yalc/dbms/modules/logger"
	"yalc/dbms/modules/pgx"
	"yalc/dbms/shared"

	v5 "github.com/jackc/pgx/v5"

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

	connPool.ExecuteTransaction(c, func(cc context.Context, tx v5.Tx) error {
		_, err := tx.Query(cc, fmt.Sprintf(sql, table.Name, whereClause))
		if err != nil {
			uc.Logger.Debugf("error deleting rows: %v", err)
			return err
		}

		return nil
	})

	return nil

}

func (uc *DeleteRowUseCase) ExecuteV2(
	ctx shared.RequestContext,
	projectId string,
	tableId string,
	input *domain.DeleteRowRequest,
) error {
	c := ctx.GetContext()

	// Get a connection pool of the database
	connPool, err := uc.Pgx.GetOrCreatePgxPool(shared.GenerateDatabaseName(projectId, ctx.GetUserId()))
	if err != nil {
		uc.Logger.Debugf("error getting pgx pool: %v", err)
		return err
	}

	return connPool.ExecuteTransaction(
		c,
		func(cc context.Context, tx v5.Tx) error {

			table, err := connPool.LookupTableInfo(cc, tableId)
			if err != nil {
				uc.Logger.Debugf("error looking up table info: %v", err)
				return err
			}

			linkColumns := make([]domain.Column, 0)
			for _, col := range table.Columns {
				if col.Type == domain.ColumnTypeLink {
					linkColumns = append(linkColumns, col)
				}
			}

			for _, rowId := range input.RowIds {
				// delete the links before delete the rows
				for _, col := range linkColumns {
					err = connPool.UpdateLinkColumn(cc, table.Name, col.Id, rowId, []int{})
					if err != nil {
						uc.Logger.Debugf("error updating link column: %v", err)
						return err
					}
				}

				// delete the row
				sql := fmt.Sprintf("DELETE FROM %s WHERE id = $1", table.Name)

				_, err = tx.Exec(cc, sql, rowId)
				if err != nil {
					uc.Logger.Debugf("error deleting row: %v", err)
					return err
				}
			}

			return nil
		},
	)
}
