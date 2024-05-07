package usecase

import (
	"fmt"
	"strings"
	"yalc/dbms/domain"
	"yalc/dbms/modules/config"
	"yalc/dbms/modules/logger"
	"yalc/dbms/modules/pgx"
	"yalc/dbms/shared"

	v5 "github.com/jackc/pgx/v5"

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

	//userTx, err := userDbPool.Begin(c)
	//if err != nil {
	//	uc.Logger.Debugf("error beginning transaction: %v", err)
	//	return nil, err
	//}

	//defer userDbPool.Rollback(userTx)

	//table, err := userDbPool.GetTableInfo(userTx, tableId)
	//if err != nil {
	//	uc.Logger.Debugf("error getting table info: %v", err)
	//	return nil, err
	//}

	//// create ADD COLUMN statements
	//newColumns := make([]domain.Column, len(data.Columns))
	//newColumnsQuery := make([]string, len(data.Columns))
	//for i, col := range data.Columns {
	//	newColumns[i] = domain.Column{
	//		Name: col.Name,
	//		Type: col.Type,
	//		Id:   shared.GenerateColumnId(),
	//	}

	//	newColumnsQuery[i] = "ADD COLUMN \"" + newColumns[i].Id + "\" " + shared.ColumnToPostgresType(&col.Type)
	//}

	//uc.Logger.Debugf("new columns: %v", newColumns)

	//sql := `ALTER TABLE "%s" %s;`

	//uc.Logger.Debugf("creating column: %s", fmt.Sprintf(sql, table.Name, strings.Join(newColumnsQuery, ", ")))

	//// Get a connection pool of the database
	//connPool, err := uc.Pgx.GetOrCreatePgxPool(shared.GenerateDatabaseName(projectId, ctx.GetUserId()))
	//if err != nil {
	//	uc.Logger.Debugf("error getting pgx pool: %v", err)
	//	return nil, err
	//}

	//connTx, err := connPool.Begin(c)
	//if err != nil {
	//	uc.Logger.Debugf("error beginning transaction: %v", err)
	//	return nil, err
	//}

	//defer connPool.Rollback(connTx)

	//// execute the query
	//_, err = connPool.ConnPool.Query(connTx, fmt.Sprintf(sql, table.Name, strings.Join(newColumnsQuery, ", ")))
	//if err != nil {
	//	uc.Logger.Debugf("error executing query: %v", err)
	//	return nil, err
	//}

	//// update the table metadata
	//table.Columns = append(table.Columns, newColumns...)
	//err = userDbPool.UpdateTableInfo(userTx, tableId, table)
	//if err != nil {
	//	uc.Logger.Debugf("error updating table info: %v", err)
	//	return nil, err
	//}

	//// commit the transaction
	//connPool.Commit(connTx)
	//userDbPool.Commit(userTx)

	//return table, nil

	result := &domain.Table{}

	err = userDbPool.ExecuteTransaction(c, func(userTx v5.Tx) error {
		table, err := userDbPool.GetTableInfo(c, tableId)
		if err != nil {
			uc.Logger.Debugf("error getting table info: %v", err)
			return err
		}

		// Get a connection pool of the database
		connPool, err := uc.Pgx.GetOrCreatePgxPool(shared.GenerateDatabaseName(projectId, ctx.GetUserId()))
		if err != nil {
			uc.Logger.Debugf("error getting pgx pool: %v", err)
			return err
		}

		// create ADD COLUMN statements
		newColumns := make([]domain.Column, len(data.Columns))
		newColumnsQuery := make([]string, len(data.Columns))

		// linked columns
		return connPool.ExecuteTransaction(c, func(connTx v5.Tx) error {
			for i, col := range data.Columns {
				newColumns[i] = domain.Column{
					Name: col.Name,
					Type: col.Type,
					Id:   shared.GenerateColumnId(),
				}

				newColumnsQuery[i] = "ADD COLUMN \"" + newColumns[i].Id + "\" " + shared.ColumnToPostgresType(&col.Type)

				if col.Type == domain.ColumnTypeLink {
					// create new link column on the other table
					newColId := shared.GenerateColumnId()

					linkCol := domain.Column{
						Name: table.Name,
						Id:   newColId,
						Type: domain.ColumnTypeLink,
						Reference: &domain.ColumnReference{
							TableId:  table.TID,
							ColumnId: newColumns[i].Id,
						},
					}

					linkedTable, err := userDbPool.GetTableInfo(c, col.Reference.TableId)
					if err != nil {
						uc.Logger.Debugf("error getting linked table info: %v", err)
						return err
					}

					// also set the col id to new table
					//newColumns[i].Reference.ColumnId = newColId
					newColumns[i].Reference = &domain.ColumnReference{
						TableId:  linkedTable.TID,
						ColumnId: newColId,
					}

					//linkedColumns = append(linkedColumns, linkCol)

					// set linked column of new table
					sql := `ALTER TABLE "%s" ADD COLUMN "%s" JSONB;`

					uc.Logger.Debugf("creating link column: %s",
						fmt.Sprintf(sql, linkedTable.Name, newColId))

					_, err = connTx.Exec(c, fmt.Sprintf(sql, linkedTable.Name, newColId))
					if err != nil {
						uc.Logger.Debugf("error creating link column: %v", err)
						return err
					}

					// update table metadata
					linkedTable.Columns = append(linkedTable.Columns, linkCol)
					err = userDbPool.UpdateTableInfo(c, col.Reference.TableId, linkedTable)
					if err != nil {
						uc.Logger.Debugf("error updating linked table info: %v", err)
						return err
					}
				}
			}

			uc.Logger.Debugf("new columns: %v", newColumns)

			sql := `ALTER TABLE "%s" %s;`

			uc.Logger.Debugf("creating column: %s", fmt.Sprintf(sql, table.Name, strings.Join(newColumnsQuery, ", ")))

			_, err := connTx.Exec(c, fmt.Sprintf(sql, table.Name, strings.Join(newColumnsQuery, ", ")))
			if err != nil {
				uc.Logger.Debugf("error executing query: %v", err)
				return err
			}

			// update the table metadata
			table.Columns = append(table.Columns, newColumns...)
			err = userDbPool.UpdateTableInfo(c, tableId, table)
			if err != nil {
				uc.Logger.Debugf("error updating table info: %v", err)
				return err
			}

			result = table

			return nil
		})

	})

	return result, err
}
