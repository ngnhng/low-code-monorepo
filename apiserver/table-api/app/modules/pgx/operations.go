package pgx

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type (
	// Per DB connection pool configuration
	Pgx struct {
		ConnPool *pgxpool.Pool
	}

	// txCtx key.
	txCtx struct{}

	// connCtx key.
	connCtx struct{}
)

// ExecTx executes a Transaction with the provided function
func (p *Pgx) ExecTx(ctx context.Context, f func(*Pgx) error) error {
	tx, err := p.ConnPool.BeginTx(ctx, pgx.TxOptions{
		IsoLevel: pgx.ReadCommitted, // the transaction can only see data committed before the transaction began
	})
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	if err := f(p); err != nil {
		if rbErr := tx.Rollback(ctx); rbErr != nil {
			return fmt.Errorf("tx: %v, rb: %v", err, rbErr)
		}
	}

	return tx.Commit(ctx)
}

// AcquireConn acquires a connection from the pool
func (p *Pgx) acquireConn(ctx context.Context) (*pgxpool.Conn, error) {
	conn, err := p.ConnPool.Acquire(ctx)
	if err != nil {
		return nil, err
	}

	return conn, nil
}

// ReleaseConn releases a connection back to the pool
func (p *Pgx) releaseConn(conn *pgxpool.Conn) {
	conn.Release()
}

// WithAcquire returns a copy of the parent context which acquires a connection
// to PostgreSQL from pgxpool to make sure commands executed in series reuse the
// same database connection.
//
// To release the connection back to the pool, you must call postgres.Release(ctx).
//
// Example:
// dbCtx := db.WithAcquire(ctx)
// defer postgres.Release(dbCtx)
func (db *Pgx) WithAcquire(ctx context.Context) (dbCtx context.Context, err error) {
	if _, ok := ctx.Value(connCtx{}).(*pgxpool.Conn); ok {
		panic("context already has a connection acquired")
	}
	res, err := db.ConnPool.Acquire(ctx)
	if err != nil {
		return nil, err
	}
	return context.WithValue(ctx, connCtx{}, res), nil
}

// Release PostgreSQL connection acquired by context back to the pool.
func (db *Pgx) Release(ctx context.Context) {
	if res, ok := ctx.Value(connCtx{}).(*pgxpool.Conn); ok && res != nil {
		res.Release()
	}
}

// GetTablesInfo returns the tables info from the database
func (p *Pgx) GetTablesInfo(ctx context.Context) (interface{}, error) {
	// acquire a connection from the pool
	conn, err := p.acquireConn(ctx)
	if err != nil {
		return nil, err
	}
	defer p.releaseConn(conn)

	// get the tables info from the database
	// Query executes sql with args. If there is an error the returned Rows will be returned in an error state. So it is
	// allowed to ignore the error returned from Query and handle it in Rows.
	//
	// For extra control over how the query is executed, the types QuerySimpleProtocol, QueryResultFormats, and
	// QueryResultFormatsByOID may be used as the first args to control exactly how the query is executed. This is rarely
	// needed. See the documentation for those types for details.
	rows, err := conn.Query(ctx, `SELECT * FROM pg_catalog.pg_tables WHERE schemaname = 'public';`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tables []string
	for rows.Next() {
		var table string
		if err := rows.Scan(&table); err != nil {
			return nil, err
		}
		tables = append(tables, table)
	}

	return tables, nil
}
