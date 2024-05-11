package usecase

import (
	"context"
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

	result := &domain.Table{}

	err = userDbPool.ExecuteTransaction(c, func(cc context.Context, userTx v5.Tx) error {
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
		return connPool.ExecuteTransaction(c, func(cc context.Context, connTx v5.Tx) error {
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

func (uc *CreateColumnUseCase) ExecuteV2(
	ctx shared.RequestContext,
	projectId string,
	tableId string,
	input *domain.CreateColumnRequest,
) (*domain.Table, error) {

	c := ctx.GetContext()

	// if data len is > 1, return error
	if len(input.Columns) > 1 {
		return nil, fmt.Errorf("only one column can be created at a time")
	}

	connPool, err := uc.Pgx.GetOrCreatePgxPool(shared.GenerateDatabaseName(projectId, ctx.GetUserId()))
	if err != nil {
		uc.Logger.Debugf("error getting user pgx pool: %v", err)
		return nil, err
	}

	// insert new column to table

	// if linked column...

	// insert new column to `yalc_cols`

	result := &domain.Table{}

	err = connPool.ExecuteTransaction(
		c,
		func(cc context.Context, tx v5.Tx) error {
			// look up table definition on `yalc_tables` and `yalc_cols`
			table, err := connPool.LookupTableInfo(cc, tableId)
			if err != nil {
				uc.Logger.Debugf("error looking up table info: %v", err)
				return err
			}

			// if not a link column, just add the column to the table
			if input.Columns[0].Type != domain.ColumnTypeLink {
				_, err := connPool.AddNewColumnToTable(cc, table, input.Columns[0])
				if err != nil {
					uc.Logger.Debugf("error adding column to table: %v", err)
					return err
				}

				result = table
				return nil
			} else { // serving m2m relation only at the moment

				if input.Columns[0].Reference == nil {
					return fmt.Errorf("reference is required for linked columns")
				}

				// if linked column
				// 1. create entries on `yalc_cols`
				// 2. create link table `yalc_mm_<id>`
				// 3. add entries to `yalc_col_relations`

				linkCol := &domain.Column{
					Id:    shared.GenerateColumnId(),
					Name:  shared.NormalizeStringForPostgres(input.Columns[0].Label),
					Label: input.Columns[0].Label,
					Type:  domain.ColumnTypeLink,
				}

				// insert to `yalc_cols`
				err := connPool.InsertToYALCCols(
					cc,
					tableId,
					linkCol.Id,
					linkCol.Name,
					linkCol.Label,
					linkCol.Type,
				)

				if err != nil {
					uc.Logger.Debugf("error inserting to yalc_cols: %v", err)
					return err
				}

				linkedCol := &domain.Column{
					Id:    shared.GenerateColumnId(),
					Name:  shared.NormalizeStringForPostgres(table.Name) + "_" + shared.GenerateColumnId(),
					Label: table.Label,
					Type:  domain.ColumnTypeLink,
				}

				// insert to `yalc_cols`
				err = connPool.InsertToYALCCols(
					cc,
					input.Columns[0].Reference.TableId,
					linkedCol.Id,
					linkedCol.Name,
					linkedCol.Label,
					linkedCol.Type,
				)

				childTable, err := connPool.LookupTableInfo(
					cc,
					input.Columns[0].Reference.TableId,
				)

				if err != nil {
					uc.Logger.Debugf("error looking up child table info: %v", err)
					return err
				}

				// create new mm table
				mmTable, err := connPool.CreateMMLinkTable(
					cc,
					*table,
					*childTable,
				)

				// get PK column of parent and child
				parentPKCol, err := connPool.GetPKColumn(cc, tableId)
				if err != nil {
					uc.Logger.Debugf("error getting parent pk column: %v", err)
					return err
				}

				childPKCol, err := connPool.GetPKColumn(cc, input.Columns[0].Reference.TableId)
				if err != nil {
					uc.Logger.Debugf("error getting child pk column: %v", err)
					return err
				}

				// weak convention -- parent table is the first col
				err = connPool.InsertToYALCColRelations(
					cc,
					linkCol.Id,
					tableId,
					childPKCol.Id,
					parentPKCol.Id,
					mmTable.TID,
					mmTable.Columns[1].Id,
					mmTable.Columns[0].Id,
				)
				if err != nil {
					uc.Logger.Debugf("error inserting to yalc_col_relations: %v", err)
					return err
				}

				// also insert the same to the child table
				err = connPool.InsertToYALCColRelations(
					cc,
					linkedCol.Id,
					input.Columns[0].Reference.TableId,
					parentPKCol.Id,
					childPKCol.Id,
					mmTable.TID,
					mmTable.Columns[0].Id,
					mmTable.Columns[1].Id,
				)
				if err != nil {
					uc.Logger.Debugf("error inserting to yalc_col_relations: %v", err)
					return err
				}
			}

			result, err = connPool.LookupTableInfo(cc, tableId)
			if err != nil {
				uc.Logger.Debugf("error looking up table info: %v", err)
				return err
			}

			return nil

		},
	)

	return result, err

}
