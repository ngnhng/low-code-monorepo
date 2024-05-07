package usecase

import (
	"fmt"
	"yalc/dbms/domain"
	"yalc/dbms/modules/config"
	"yalc/dbms/modules/logger"
	"yalc/dbms/modules/pgx"
	"yalc/dbms/shared"

	"go.uber.org/fx"
)

type (
	CreateTableUseCase struct {
		Config *config.Config
		Logger logger.Logger

		Pgx *pgx.PgxManager
	}

	CreateTableUseCaseParams struct {
		fx.In

		Config *config.Config
		Logger logger.Logger

		Pgx *pgx.PgxManager
	}
)

func NewCreateTableUseCase(p CreateTableUseCaseParams) *CreateTableUseCase {
	return &CreateTableUseCase{
		Config: p.Config,
		Logger: p.Logger,
		Pgx:    p.Pgx,
	}
}

func (uc *CreateTableUseCase) Execute(
	ctx shared.RequestContext,
	projectId string,
	tableDef *domain.Table,
) (*domain.Table, error) {

	c := ctx.GetContext()

	// try to get a conn from pool cache
	connPool, err := uc.Pgx.GetOrCreatePgxPool(shared.GenerateDatabaseName(projectId, ctx.GetUserId()))
	if err != nil {
		uc.Logger.Debugf("error getting pgx pool: %v", err)
		return nil, err
	}

	// get user db pool
	userDbPool, err := uc.Pgx.GetOrCreateUserPgxPool()
	if err != nil {
		uc.Logger.Debugf("error getting user db pool: %v", err)
		return nil, err
	}

	tx1, err := connPool.Begin(c)
	if err != nil {
		uc.Logger.Debugf("error beginning transaction: %v", err)
		return nil, err
	}

	table, err := connPool.CreateTable(tx1, tableDef)
	if err != nil {
		uc.Logger.Debugf("error creating table: %v", err)
		connPool.Rollback(tx1)
		return nil, err
	}

	table.TID = shared.GenerateUUIDv4()

	uc.Logger.Debugf("metadata: %v", table)

	// add link column to other table
	// iterate through columns and add link columns
	for i, col := range table.Columns {
		if col.Type == domain.ColumnTypeLink {
			// create link column
			newColId := shared.GenerateColumnId()

			linkCol := &domain.Column{
				Name: table.Name,
				Id:   newColId,
				Type: domain.ColumnTypeLink,
				Reference: &domain.ColumnReference{
					TableId:  table.TID,
					ColumnId: col.Id,
				},
			}

			// also set the col id to new table
			table.Columns[i].Reference.ColumnId = newColId

			linkedTable, err := userDbPool.GetTableInfo(c, col.Reference.TableId)
			if err != nil {
				uc.Logger.Debugf("error getting linked table info: %v", err)
				connPool.Rollback(tx1)
				return nil, err
			}

			// set linked column of new table
			if err := connPool.ExecTx(c, func(p *pgx.Pgx) error {
				sql := `ALTER TABLE "%s" ADD COLUMN "%s" JSONB;`

				uc.Logger.Debugf("creating link column: %s",
					fmt.Sprintf(sql, linkedTable.Name, newColId))

				_, err := p.ConnPool.Exec(c, fmt.Sprintf(sql, linkedTable.Name, newColId))
				if err != nil {
					uc.Logger.Debugf("error creating link column: %v", err)
					return err
				}

				// update table metadata
				linkedTable.Columns = append(linkedTable.Columns, *linkCol)
				err = userDbPool.UpdateTableInfo(c, col.Reference.TableId, linkedTable)
				if err != nil {
					uc.Logger.Debugf("error updating linked table info: %v", err)
					return err
				}

				return nil
			}); err != nil {
				uc.Logger.Debugf("error creating link column: %v", err)
				connPool.Rollback(tx1)
				return nil, err
			}

		}
	}

	uc.Logger.Debugf("beginning transaction for upserting table metadata")

	tx2, err := userDbPool.Begin(c)
	if err != nil {
		uc.Logger.Debugf("error beginning transaction: %v", err)
		connPool.Rollback(tx1)
		return nil, err
	}

	// get project info
	project, err := userDbPool.GetProjectInfo(tx2, projectId)
	if err != nil {
		uc.Logger.Debugf("error getting project %s info: %v", projectId, err)
		connPool.Rollback(tx1)
		userDbPool.Rollback(tx2)
		return nil, err
	}

	// upsert table metadata to store
	err = userDbPool.UpsertTableInfo(tx2, project, table)
	if err != nil {
		uc.Logger.Debugf("error upserting table info: %v", err)
		connPool.Rollback(tx1)
		userDbPool.Rollback(tx2)
		return nil, err
	}

	connPool.Commit(tx1)
	userDbPool.Commit(tx2)

	return table, nil
}
