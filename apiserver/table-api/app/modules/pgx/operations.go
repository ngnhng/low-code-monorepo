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
func (p *Pgx) AcquireConn(ctx context.Context) (*pgxpool.Conn, error) {
	conn, err := p.ConnPool.Acquire(ctx)
	if err != nil {
		return nil, err
	}

	return conn, nil
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

// Query executes sql with args. If there is an error the returned Rows will be returned in an error state. So it is
// allowed to ignore the error returned from Query and handle it in Rows.
//
// For extra control over how the query is executed, the types QuerySimpleProtocol, QueryResultFormats, and
// QueryResultFormatsByOID may be used as the first args to control exactly how the query is executed. This is rarely
// needed. See the documentation for those types for details.
//func (p *Pgx) Query(ctx context.Context, sql string, args ...any) (pgx.Rows, error) {

//}

//// QueryFunc executes sql with args. For each row returned by the query the values will scanned into the elements of
//// scans and f will be called. If any row fails to scan or f returns an error the query will be aborted and the error
//// will be returned.
//QueryFunc(
//	ctx context.Context,
//	sql string,
//	args []any,
//	scans []any,
//	f func(pgx.QueryFuncRow) error,
//) (pgconn.CommandTag, error)

//// QueryRow is a convenience wrapper over Query. Any error that occurs while
//// querying is deferred until calling Scan on the returned Row. That Row will
//// error with ErrNoRows if no rows are returned.
//QueryRow(ctx context.Context, sql string, args ...any) pgx.Row
