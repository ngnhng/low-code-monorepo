package pgx

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"
	"yalc/dbms/domain"
	"yalc/dbms/modules/logger"
	"yalc/dbms/shared"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/jackc/pgx/v5/pgtype"
)

type (
	// Per DB connection pool configuration
	Pgx struct {
		ConnPool *pgxpool.Pool
		Logger   logger.Logger
	}

	// txCtx key.
	txCtx struct{}

	// connCtx key.
	connCtx struct{}

	txFunc func(tx pgx.Tx) error
)

func (p *Pgx) Begin(ctx context.Context) (context.Context, error) {
	tx, err := p.ConnPool.Begin(ctx)
	if err != nil {
		p.Logger.Errorf("failed to begin transaction: %v", err)
		return nil, err
	}
	return context.WithValue(ctx, txCtx{}, tx), nil
}

func (p *Pgx) Commit(ctx context.Context) error {
	tx, ok := ctx.Value(txCtx{}).(pgx.Tx)
	if !ok {
		return fmt.Errorf("no transaction found in context")
	}
	if err := tx.Commit(ctx); err != nil {
		return err
	}
	return nil
}

func (p *Pgx) Rollback(ctx context.Context) error {
	tx, ok := ctx.Value(txCtx{}).(pgx.Tx)
	if !ok {
		return fmt.Errorf("no transaction found in context")
	}
	if err := tx.Rollback(ctx); err != nil {
		return err
	}
	return nil
}

//// ExecTx executes a Transaction with the provided function
//func (p *Pgx) ExecTx(ctx context.Context, f func(*Pgx) error) error {
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
//		p.Logger.Debug("transaction rolled back")
//		return err
//	}
//	p.Logger.Debug("transaction committed")
//	return tx.Commit(ctx)
//}

func (p *Pgx) ExecuteTransaction(ctx context.Context, f txFunc) error {
	ctx, err := p.Begin(ctx)
	if err != nil {
		return err
	}

	tx, ok := ctx.Value(txCtx{}).(pgx.Tx)
	if !ok {
		return fmt.Errorf("no transaction found in context")
	}

	err = f(tx)
	if err != nil {
		if rbErr := tx.Rollback(ctx); rbErr != nil {
			return fmt.Errorf("tx: %v, rb: %v", err, rbErr)
		}

		return err
	}

	return tx.Commit(ctx)
}

// AcquireConn acquires a connection from the pool
func (p *Pgx) acquireConn(ctx context.Context) (*pgxpool.Conn, error) {
	p.Logger.Debug("acquiring connection from the pool")
	conn, err := p.ConnPool.Acquire(ctx)
	if err != nil {
		return nil, err
	}

	return conn, nil
}

// ReleaseConn releases a connection back to the pool
func (p *Pgx) releaseConn(conn *pgxpool.Conn) {
	p.Logger.Debug("releasing connection back to the pool")
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
	db.Logger.Debug("releasing connection back to the pool")
	if res, ok := ctx.Value(connCtx{}).(*pgxpool.Conn); ok && res != nil {
		res.Release()
	}
}

//// GetTablesInfo returns the tables info from the database
//func (p *Pgx) GetTablesInfo(ctx context.Context) ([]*domain.Table, error) {
//	// acquire a connection from the pool
//	conn, err := p.acquireConn(ctx)
//	if err != nil {
//		return nil, err
//	}
//	defer p.releaseConn(conn)

//	// get the tables and columns info from the database
//	rows, err := conn.Query(ctx, `
//        SELECT t.tablename, c.column_name, c.data_type
//        FROM pg_catalog.pg_tables t
//        JOIN information_schema.columns c ON t.tablename = c.table_name
//        WHERE t.schemaname = 'public' AND c.table_schema = 'public';
//    `)
//	if err != nil {
//		p.Logger.Errorf("failed to get tables and columns info: %v", err)
//		return nil, err
//	}
//	defer rows.Close()

//	tables := make(map[string]map[string]string)
//	for rows.Next() {
//		var table, column, dataType string
//		if err := rows.Scan(&table, &column, &dataType); err != nil {
//			return nil, err
//		}

//		if _, ok := tables[table]; !ok {
//			tables[table] = make(map[string]string)
//		}
//		tables[table][column] = dataType
//	}

//	p.Logger.Debugf("tables: %v", tables)

//	return tables, nil
//}

// CreateTable creates a new table in the database
func (p *Pgx) CreateTable(ctx context.Context, def *domain.Table) (*domain.Table, error) {
	tx, ok := ctx.Value(txCtx{}).(pgx.Tx)
	if !ok {
		// acquire a connection from the pool
		conn, err := p.acquireConn(ctx)
		if err != nil {
			return nil, err
		}

		defer p.releaseConn(conn)

		return p.createTable(ctx, conn.Exec, def)
	}

	return p.createTableTx(ctx, tx, def)
}

func (p *Pgx) createTable(
	ctx context.Context,
	exec func(context.Context, string, ...interface{}) (pgconn.CommandTag, error),
	def *domain.Table,
) (*domain.Table, error) {

	colIds := make([]string, len(def.Columns))

	// first auto create an id serial column
	idCol := `id SERIAL PRIMARY KEY`

	// create a new table
	s := `CREATE TABLE "{tableName}" (`
	s += idCol + ", "
	for i, col := range def.Columns {
		// generate a new column id
		colId := shared.GenerateColumnId()
		colIds[i] = colId

		s += fmt.Sprintf("\"%s\" %s", colId, shared.ColumnToPostgresType(&col.Type))
		if i < len(def.Columns)-1 {
			s += ", "
		}
	}
	s += ");"

	s = strings.Replace(s, "{tableName}", def.Name, -1)

	p.Logger.Debugf("creating table: %s", s)

	tag, err := exec(ctx, s)

	var pgErr *pgconn.PgError
	if err != nil {
		if errors.As(err, &pgErr) {
			p.Logger.Errorf("pg error: %v", pgErr)
		}
		switch pgErr.Code {
		case "42P07":
			p.Logger.Errorf("table already exists")
			return nil, fmt.Errorf("table already exists")
		case "42601":
			p.Logger.Errorf("syntax error")
			return nil, fmt.Errorf("syntax error")
		default:
			return nil, fmt.Errorf("failed to create table: %v", err)
		}
	}

	if tag.RowsAffected() == 0 {
		p.Logger.Debug("table created successfully")
		p.Logger.Debugf("columns: %v", colIds)
		p.Logger.Debugf("table definition: %v", def)

	}

	table := &domain.Table{
		Name: def.Name,
		//Columns: []domain.Column{{
		//	Id:   "id",
		//	Name: "id",
		//	Type: domain.ColumnTypePrimaryKey,
		//}},
	}

	for i := range def.Columns {
		table.Columns = append(table.Columns, domain.Column{
			Id:        colIds[i],
			Name:      def.Columns[i].Name,
			Type:      def.Columns[i].Type,
			Reference: def.Columns[i].Reference,
		})
	}

	return table, nil
}

func (p *Pgx) createTableTx(
	ctx context.Context,
	tx pgx.Tx,
	def *domain.Table,
) (*domain.Table, error) {
	return p.createTable(ctx, tx.Exec, def)
}

func (p *Pgx) Upsert(
	ctx context.Context,
	table string,
	colVal map[string]any,
) error {
	tx, ok := ctx.Value(txCtx{}).(pgx.Tx)
	if !ok {
		// acquire a connection from the pool
		conn, err := p.acquireConn(ctx)
		if err != nil {
			return err
		}
		defer p.releaseConn(conn)

		return p.upsert(ctx, conn.Exec, table, colVal)
	}

	return p.upsertTx(ctx, tx, table, colVal)
}

func (p *Pgx) upsertTx(
	ctx context.Context,
	tx pgx.Tx,
	table string,
	colVal map[string]any,
) error {
	return p.upsert(ctx, tx.Exec, table, colVal)
}

func (p *Pgx) upsert(
	ctx context.Context,
	exec func(context.Context, string, ...interface{}) (pgconn.CommandTag, error),
	table string,
	colVal map[string]any,
) error {

	// upsert the data to the table
	s := `INSERT INTO "{tableName}" ({columns}) VALUES ({values}) ON CONFLICT ({conflictColumns}) DO UPDATE SET {updateColumns};`
	s = strings.Replace(s, "{tableName}", table, -1)

	var columns, values, conflictColumns, updateColumns string
	for col, val := range colVal {
		columns += col + ", "
		values += fmt.Sprintf("'%v', ", val)
		conflictColumns += col + ", "
		updateColumns += fmt.Sprintf("%s = excluded.%s, ", col, col)
	}

	columns = strings.TrimSuffix(columns, ", ")

	values = strings.TrimSuffix(values, ", ")

	conflictColumns = strings.TrimSuffix(conflictColumns, ", ")

	updateColumns = strings.TrimSuffix(updateColumns, ", ")

	s = strings.Replace(s, "{columns}", columns, -1)
	s = strings.Replace(s, "{values}", values, -1)
	s = strings.Replace(s, "{conflictColumns}", conflictColumns, -1)
	s = strings.Replace(s, "{updateColumns}", updateColumns, -1)

	p.Logger.Debugf("upserting data: %s", s)

	_, err := exec(ctx, s)

	if err != nil {
		return fmt.Errorf("failed to upsert data: %v", err)
	}

	return nil
}

func (p *Pgx) GetTableData(
	ctx context.Context,
	tableName string,
	query *domain.Query,
	limit, offset int,
) (*domain.GetTableDataResponse, error) {
	tx, ok := ctx.Value(txCtx{}).(pgx.Tx)
	if !ok {
		// acquire a connection from the pool
		conn, err := p.acquireConn(ctx)
		if err != nil {
			return nil, err
		}
		defer p.releaseConn(conn)

		return p.getTableData(ctx, conn.Query, tableName, query, limit, offset)
	}

	return p.getTableDataTx(ctx, tx, tableName, query, limit, offset)
}

func (p *Pgx) getTableDataTx(
	ctx context.Context,
	tx pgx.Tx,
	tableName string,
	query *domain.Query,
	limit, offset int,
) (*domain.GetTableDataResponse, error) {
	return p.getTableData(ctx, tx.Query, tableName, query, limit, offset)
}

func (p *Pgx) getTableData(
	ctx context.Context,
	queryFn func(ctx context.Context, sql string, args ...any) (pgx.Rows, error),
	tableName string,
	query *domain.Query,
	limit, offset int,
) (*domain.GetTableDataResponse, error) {
	// replace ? with $1, $2, $3, ... in the query
	queryStr := shared.ReplacePlaceholders(query.Sql)
	params := query.Params

	p.Logger.Debugf("getting table data: %s", fmt.Sprintf(`SELECT * FROM "%s" WHERE %s LIMIT %d OFFSET %d;`, tableName, queryStr, limit, offset))

	// get the table data
	rows, err := queryFn(
		ctx,
		fmt.Sprintf(`SELECT * FROM "%s" WHERE %s LIMIT %d OFFSET %d;`, tableName, queryStr, limit, offset),
		params...,
	)
	if err != nil {
		p.Logger.Errorf("failed to get table data: %v", err)
		return nil, err
	}
	fields := rows.FieldDescriptions()

	defer rows.Close()

	var data [][]interface{}
	for rows.Next() {
		cols := make([]interface{}, len(fields))
		colPtrs := make([]interface{}, len(fields))
		for i := range cols {
			colPtrs[i] = &cols[i]
		}
		if err := rows.Scan(colPtrs...); err != nil {
			return nil, err
		}
		data = append(data, cols)
	}

	// Convert data to [][]string
	stringData := make([][]string, len(data))
	for i, row := range data {
		for _, col := range row {
			//p.Logger.Debugf("column type: %T", col)
			str := parseValueToString(col)
			//if !ok {
			//	return nil, fmt.Errorf("failed to convert column to string: %v", col)
			//}
			stringData[i] = append(stringData[i], str)
		}
	}

	cols := make([]domain.Column, len(fields))
	for i, field := range fields {
		cols[i] = domain.Column{
			Id: field.Name,
			//Name: field.Name,
			Type: domain.DataTypeMap[field.DataTypeOID],
		}
	}

	return &domain.GetTableDataResponse{
		Rows:    stringData,
		Columns: cols,
	}, nil
}

func parseValueToStringByType(v any, typ domain.ColumnType) string {
	switch typ {
	case domain.ColumnTypeString:
		return fmt.Sprintf("'%v'", v)
	default:
		return fmt.Sprintf("%v", v)
	}
}

func parseValueToString(v any) string {
	switch v.(type) {
	case pgtype.Time:
		ms := v.(pgtype.Time).Microseconds
		// return time in 15:04:05 string format
		format := time.Unix(0, ms*1000).UTC().Format("15:04:05")
		return format

	case time.Time:
		// return time in 2006-01-02 15:04:05 string format
		return v.(time.Time).UTC().Format("2006-01-02 15:04:05")

	default:
		return fmt.Sprintf("%v", v)
	}
}
