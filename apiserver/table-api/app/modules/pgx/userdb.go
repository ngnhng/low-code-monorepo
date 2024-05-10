package pgx

import (
	"context"
	"fmt"
	"yalc/dbms/domain"
	"yalc/dbms/modules/logger"

	"encoding/json"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type (
	UserDbPgxPool struct {
		ConnPool *pgxpool.Pool
		Logger   logger.Logger
	}

	userDbCtx struct{}
)

//func (p *UserDbPgxPool) ExecTx(ctx context.Context, f func(*UserDbPgxPool) error) error {
//	tx, err := p.ConnPool.BeginTx(ctx, pgx.TxOptions{
//		IsoLevel: pgx.ReadCommitted, // the transaction can only see data committed before the transaction began
//	})
//	if err != nil {
//		p.Logger.Errorf("failed to begin transaction: %v", err)
//		return err
//	}
//	p.Logger.Debug("transaction started")
//	defer tx.Rollback(ctx)

//	if err := f(p); err != nil {
//		if rbErr := tx.Rollback(ctx); rbErr != nil {
//			return fmt.Errorf("tx: %v, rb: %v", err, rbErr)
//		}
//		return err
//	}

//	return tx.Commit(ctx)
//}

func (p *UserDbPgxPool) Begin(ctx context.Context) (context.Context, error) {
	tx, err := p.ConnPool.Begin(ctx)
	if err != nil {
		p.Logger.Errorf("failed to begin transaction: %v", err)
		return nil, err
	}
	return context.WithValue(ctx, userDbCtx{}, tx), nil
}

func (p *UserDbPgxPool) Commit(ctx context.Context) error {
	tx, ok := ctx.Value(userDbCtx{}).(pgx.Tx)
	if !ok {
		return fmt.Errorf("no transaction found in context")
	}
	if err := tx.Commit(ctx); err != nil {
		return err
	}

	return nil
}

func (p *UserDbPgxPool) Rollback(ctx context.Context) error {
	tx, ok := ctx.Value(userDbCtx{}).(pgx.Tx)
	if !ok {
		return fmt.Errorf("no transaction found in context")
	}
	if err := tx.Rollback(ctx); err != nil {
		return err
	}

	return nil
}

// AcquireConn acquires a connection from the pool
func (p *UserDbPgxPool) acquireConn(ctx context.Context) (*pgxpool.Conn, error) {
	p.Logger.Debug("acquiring connection from the pool")
	conn, err := p.ConnPool.Acquire(ctx)
	if err != nil {
		return nil, err
	}

	return conn, nil
}

// ReleaseConn releases a connection back to the pool
func (p *UserDbPgxPool) releaseConn(conn *pgxpool.Conn) {
	p.Logger.Debug("releasing connection back to the pool")
	conn.Release()
}

func (p *UserDbPgxPool) GetProjectInfo(ctx context.Context, projectId string) (*domain.Project, error) {

	tx, err := getTx(ctx)
	if err == nil {
		return p.getProjectInfoTx(ctx, tx, projectId)
	}

	// acquire a connection from the pool
	conn, err := p.acquireConn(ctx)
	if err != nil {
		p.Logger.Debug("error acquiring connection: %v", err)
		return nil, err
	}

	defer p.releaseConn(conn)

	return p.getProjectInfo(ctx, conn.QueryRow, projectId)
}

func (p *UserDbPgxPool) getProjectInfoTx(
	ctx context.Context,
	tx pgx.Tx,
	projectId string,
) (*domain.Project, error) {
	return p.getProjectInfo(ctx, tx.QueryRow, projectId)
}

func (p *UserDbPgxPool) getProjectInfo(
	ctx context.Context,
	queryRow func(context.Context, string, ...interface{}) pgx.Row,
	projectId string,
) (*domain.Project, error) {
	sql := `SELECT "id", "title", "userId" FROM "Project" WHERE "pid" = $1`

	row := queryRow(ctx, sql, projectId)

	project := &domain.Project{
		PID: projectId,
	}

	err := row.Scan(&project.Id, &project.Name, &project.OwnerId)
	if err != nil {
		p.Logger.Debugf("error scanning project info: %v", err)
		return nil, err
	}

	return project, nil
}

func (p *UserDbPgxPool) UpsertTableInfo(ctx context.Context, project *domain.Project, meta *domain.Table) error {

	tx, err := getTx(ctx)
	if err == nil {
		return p.upsertTableInfoTx(ctx, tx, project, meta)
	}

	// acquire a connection from the pool
	conn, err := p.acquireConn(ctx)
	if err != nil {
		p.Logger.Debugf("error acquiring connection: %v", err)
		return err
	}

	defer p.releaseConn(conn)

	return p.upsertTableInfo(ctx, conn.Exec, project, meta)
}

func (p *UserDbPgxPool) upsertTableInfoTx(ctx context.Context, tx pgx.Tx, project *domain.Project, meta *domain.Table) error {
	return p.upsertTableInfo(ctx, tx.Exec, project, meta)
}

func (p *UserDbPgxPool) upsertTableInfo(
	ctx context.Context,
	exec func(context.Context, string, ...interface{}) (pgconn.CommandTag, error),
	project *domain.Project,
	meta *domain.Table,
) error {
	// convert the meta to json
	metaJson, err := json.Marshal(meta.Columns)
	if err != nil {
		p.Logger.Debugf("error marshalling table metadata: %v", err)
		return err
	}

	// upsert table info
	sql := `INSERT INTO "Table" ("projectId", "tableData", "tableName", "tid", "userId") VALUES ($1, $2, $3, $4, $5) ON CONFLICT ("projectId", "tableName") DO UPDATE SET "tableData" = $2`

	_, err = exec(ctx, sql, project.Id, metaJson, meta.Name, meta.TID, project.OwnerId)
	if err != nil {
		p.Logger.Debugf("error upserting table info: %v", err)
		return err
	}

	return nil
}

func (p *UserDbPgxPool) GetTablesInfo(ctx context.Context, projectId string) ([]*domain.Table, error) {

	tx, err := getTx(ctx)
	if err == nil {
		return p.getTablesInfoTx(ctx, tx, projectId)
	}

	// acquire a connection from the pool
	conn, err := p.acquireConn(ctx)
	if err != nil {
		p.Logger.Debugf("error acquiring connection: %v", err)
		return nil, err
	}

	defer p.releaseConn(conn)

	return p.getTablesInfo(ctx, conn.Query, projectId)
}

func (p *UserDbPgxPool) getTablesInfoTx(ctx context.Context, tx pgx.Tx, projectId string) ([]*domain.Table, error) {
	return p.getTablesInfo(ctx, tx.Query, projectId)
}

func (p *UserDbPgxPool) getTablesInfo(ctx context.Context, query func(context.Context, string, ...interface{}) (pgx.Rows, error), projectId string) ([]*domain.Table, error) {
	// get table info
	sql := `SELECT "tid", "tableName", "tableData" FROM "Table" JOIN "Project" ON "Table"."projectId" = "Project"."id" WHERE "Project"."pid" = $1`

	rows, err := query(ctx, sql, projectId)
	if err != nil {
		p.Logger.Debugf("error querying table info: %v", err)
		return nil, err
	}

	defer rows.Close()

	var tables []*domain.Table
	for rows.Next() {
		var table domain.Table
		var tableData string
		err = rows.Scan(&table.TID, &table.Name, &tableData)
		if err != nil {
			p.Logger.Debugf("error scanning table info: %v", err)
			return nil, err
		}

		err = json.Unmarshal([]byte(tableData), &table.Columns)
		if err != nil {
			p.Logger.Debugf("error unmarshalling table data: %v", err)
			return nil, err
		}

		tables = append(tables, &table)
	}

	return tables, nil
}

func (p *UserDbPgxPool) GetTableInfo(ctx context.Context, tableId string) (*domain.Table, error) {

	tx, err := getTx(ctx)
	if err == nil {
		return p.getTableInfoTx(ctx, tx, tableId)
	}

	// acquire a connection from the pool
	conn, err := p.acquireConn(ctx)
	if err != nil {
		p.Logger.Debugf("error acquiring connection: %v", err)
		return nil, err
	}

	defer p.releaseConn(conn)

	return p.getTableInfo(ctx, conn.QueryRow, tableId)
}

func (p *UserDbPgxPool) getTableInfoTx(ctx context.Context, tx pgx.Tx, tableId string) (*domain.Table, error) {
	return p.getTableInfo(ctx, tx.QueryRow, tableId)
}

func (p *UserDbPgxPool) getTableInfo(ctx context.Context, queryRow func(context.Context, string, ...interface{}) pgx.Row, tableId string) (*domain.Table, error) {

	sql := `SELECT "tableName", "tableData" FROM "Table" WHERE "tid" = $1`

	row := queryRow(ctx, sql, tableId)

	var table domain.Table
	var tableData string
	err := row.Scan(&table.Name, &tableData)
	if err != nil {
		p.Logger.Debugf("error scanning table info: %v", err)
		return nil, err
	}

	err = json.Unmarshal([]byte(tableData), &table.Columns)
	if err != nil {
		p.Logger.Debugf("error unmarshalling table data: %v", err)
		return nil, err
	}

	table.TID = tableId

	return &table, nil
}

func (p *UserDbPgxPool) UpdateTableInfo(ctx context.Context, tableId string, meta *domain.Table) error {

	tx, err := getTx(ctx)
	if err == nil {
		return p.updateTableInfoTx(ctx, tx, tableId, meta)
	}

	// acquire a connection from the pool
	conn, err := p.acquireConn(ctx)
	if err != nil {
		p.Logger.Debugf("error acquiring connection: %v", err)
		return err
	}

	defer p.releaseConn(conn)

	return p.updateTableInfo(ctx, conn.Exec, tableId, meta)
}

func (p *UserDbPgxPool) updateTableInfoTx(ctx context.Context, tx pgx.Tx, tableId string, meta *domain.Table) error {
	return p.updateTableInfo(ctx, tx.Exec, tableId, meta)
}

func (p *UserDbPgxPool) updateTableInfo(
	ctx context.Context,
	exec func(ctx context.Context, sql string, arguments ...any) (pgconn.CommandTag, error),
	tableId string,
	meta *domain.Table,
) error {
	// convert the meta to json
	metaJson, err := json.Marshal(meta.Columns)
	if err != nil {
		p.Logger.Debugf("error marshalling table metadata: %v", err)
		return err
	}

	// update table info
	sql := `UPDATE "Table" SET "tableData" = $1 WHERE "tid" = $2`

	_, err = exec(ctx, sql, metaJson, tableId)
	if err != nil {
		p.Logger.Debugf("error updating table info: %v", err)
		return err
	}

	return nil
}

func (p *UserDbPgxPool) DeleteTable(ctx context.Context, projectId, tableId string) error {
	tx, err := getTx(ctx)
	if err == nil {
		return p.deleteTableTx(ctx, tx, tableId)
	}

	// acquire a connection from the pool
	conn, err := p.acquireConn(ctx)
	if err != nil {
		p.Logger.Debugf("error acquiring connection: %v", err)
		return err
	}

	defer p.releaseConn(conn)

	return p.deleteTable(ctx, conn.Exec, tableId)
}

func (p *UserDbPgxPool) deleteTableTx(ctx context.Context, tx pgx.Tx, tableId string) error {
	return p.deleteTable(ctx, tx.Exec, tableId)
}

func (p *UserDbPgxPool) deleteTable(
	ctx context.Context,
	exec func(ctx context.Context, sql string, arguments ...any) (pgconn.CommandTag, error),
	tableId string,
) error {
	// delete table info
	sql := `DELETE FROM "Table" WHERE "tid" = $1`

	_, err := exec(ctx, sql, tableId)
	if err != nil {
		p.Logger.Debugf("error deleting table info: %v", err)
		return err
	}

	return nil
}

func (udpp *UserDbPgxPool) ExecuteTransaction(ctx context.Context, f txFunc) error {
	ctx, err := udpp.Begin(ctx)
	if err != nil {
		return err
	}

	tx, ok := ctx.Value(userDbCtx{}).(pgx.Tx)
	if !ok {
		return fmt.Errorf("no transaction found in context")
	}

	err = f(ctx, tx)
	if err != nil {
		if rbErr := tx.Rollback(ctx); rbErr != nil {
			return fmt.Errorf("tx: %v, rb: %v", err, rbErr)
		}

		return err
	}

	return tx.Commit(ctx)
}

func getTx(ctx context.Context) (pgx.Tx, error) {
	tx, ok := ctx.Value(userDbCtx{}).(pgx.Tx)
	if !ok {
		return nil, fmt.Errorf("no transaction found in context")
	}

	return tx, nil
}
