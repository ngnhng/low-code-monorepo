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
	TxCtx struct{}

	// connCtx key.
	connCtx struct{}

	txFunc func(cc context.Context, tx pgx.Tx) error
)

func (p *Pgx) Begin(ctx context.Context) (context.Context, error) {
	tx, err := p.ConnPool.BeginTx(ctx, pgx.TxOptions{
		IsoLevel: pgx.ReadCommitted, // the transaction can see its own uncommitted changes
	})

	if err != nil {
		p.Logger.Errorf("failed to begin transaction: %v", err)
		return nil, err
	}
	return context.WithValue(ctx, TxCtx{}, tx), nil
}

func (p *Pgx) Commit(ctx context.Context) error {
	tx, ok := ctx.Value(TxCtx{}).(pgx.Tx)
	if !ok {
		return fmt.Errorf("no transaction found in context")
	}
	if err := tx.Commit(ctx); err != nil {
		return err
	}
	return nil
}

func (p *Pgx) Rollback(ctx context.Context) error {
	tx, ok := ctx.Value(TxCtx{}).(pgx.Tx)
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

	p.Logger.Debugf("executing transaction: %v", ctx)

	tx, ok := ctx.Value(TxCtx{}).(pgx.Tx)
	if !ok {
		return fmt.Errorf("no transaction found in context")
	}

	err = f(ctx, tx)
	if err != nil {
		if rbErr := tx.Rollback(ctx); rbErr != nil {
			p.Logger.Errorf("tx: %v, rb: %v", err, rbErr)
			return fmt.Errorf("tx: %v, rb: %v", err, rbErr)
		}

		p.Logger.Debugf("transaction rolled back: %v", err)
		return err
	}

	p.Logger.Debug("committing transaction")

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
	tx, ok := ctx.Value(TxCtx{}).(pgx.Tx)
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
	tx, ok := ctx.Value(TxCtx{}).(pgx.Tx)
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
	tx, ok := ctx.Value(TxCtx{}).(pgx.Tx)
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

// CreateTable creates a new table in the database
func (p *Pgx) CreateTableV2(ctx context.Context, def *domain.Table) (*domain.Table, error) {
	tx, ok := ctx.Value(TxCtx{}).(pgx.Tx)
	if !ok {
		// acquire a connection from the pool
		conn, err := p.acquireConn(ctx)
		if err != nil {
			return nil, err
		}

		defer p.releaseConn(conn)

		return p.createTableV2(ctx, conn.Exec, def)
	}

	return p.createTableTxV2(ctx, tx, def)
}

func (p *Pgx) createTableV2(
	ctx context.Context,
	exec func(context.Context, string, ...interface{}) (pgconn.CommandTag, error),
	input *domain.Table,
) (*domain.Table, error) {

	var tableName string
	if input.Name == "" {
		tableName = shared.NormalizeStringForPostgres(input.Label)
	} else {
		tableName = input.Name
	}

	// first auto create an id serial column
	//idCol := `id SERIAL PRIMARY KEY`
	// append to start of columns
	pkCol := domain.Column{
		Name:  "id",
		Label: "id",
		Type:  domain.ColumnTypePrimaryKey,
	}
	input.Columns = append([]domain.Column{pkCol}, input.Columns...)

	colIds := make([]string, len(input.Columns))
	colNames := make([]string, len(input.Columns))
	colTypes := make([]string, len(input.Columns))

	// create a new table
	s := `CREATE TABLE "{tableName}" (`
	//s += idCol + ", "
	for i, col := range input.Columns {
		// generate a new column id
		colId := shared.GenerateColumnId()
		colIds[i] = colId
		colName := shared.NormalizeStringForPostgres(col.Label)
		colNames[i] = colName
		colType := shared.ColumnToPostgresType(&col.Type)
		colTypes[i] = colType

		s += fmt.Sprintf(
			"\"%s\" %s",
			colName,
			colType,
		)
		if i < len(input.Columns)-1 {
			s += ", "
		}
	}
	s += ");"

	s = strings.Replace(s, "{tableName}", tableName, -1)

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
		p.Logger.Debugf("table definition: %v", input)

	}

	table := &domain.Table{
		TID:   shared.GenerateTableId(),
		Name:  tableName,
		Label: input.Label,
	}

	for i := range input.Columns {
		table.Columns = append(table.Columns, domain.Column{
			Id:    colIds[i],
			Name:  colNames[i],
			Label: input.Columns[i].Label,
			Type:  input.Columns[i].Type,
		})
	}

	return table, nil
}

func (p *Pgx) createTableTxV2(
	ctx context.Context,
	tx pgx.Tx,
	def *domain.Table,
) (*domain.Table, error) {
	return p.createTableV2(ctx, tx.Exec, def)
}

// CreateTable creates a new table in the database
func (p *Pgx) CreateDefaultTable(ctx context.Context, def *domain.Table) (*domain.Table, error) {
	tx, ok := ctx.Value(TxCtx{}).(pgx.Tx)
	if !ok {
		p.Logger.Debug("no transaction found in context")
		// acquire a connection from the pool
		conn, err := p.acquireConn(ctx)
		if err != nil {
			return nil, err
		}

		defer p.releaseConn(conn)

		return p.createDefaultTable(ctx, conn.Exec, def)
	}

	return p.createDefaultTableTx(ctx, tx, def)
}

func (p *Pgx) createDefaultTable(
	ctx context.Context,
	exec func(context.Context, string, ...interface{}) (pgconn.CommandTag, error),
	def *domain.Table,
) (*domain.Table, error) {

	// first auto create an id serial column
	idCol := `id SERIAL PRIMARY KEY`

	// create a new table
	s := `CREATE TABLE "{tableName}" (`
	s += idCol + ", "
	for i, col := range def.Columns {
		// generate a new column id

		s += fmt.Sprintf("\"%s\" %s", col.Name, shared.ColumnToPostgresType(&col.Type))
		if i < len(def.Columns)-1 {
			s += ", "
		}
	}

	// add created_at and updated_at columns
	s += ", created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"

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
			Name:      def.Columns[i].Name,
			Type:      def.Columns[i].Type,
			Reference: def.Columns[i].Reference,
		})
	}

	return table, nil
}

func (p *Pgx) createDefaultTableTx(
	ctx context.Context,
	tx pgx.Tx,
	def *domain.Table,
) (*domain.Table, error) {
	return p.createTableV2(ctx, tx.Exec, def)
}

// Insert To YALC_tables
func (p *Pgx) InsertToYALCTables(
	ctx context.Context,
	tableId, tableName, tableTitle string,
	mm bool,
) error {
	tx, ok := ctx.Value(TxCtx{}).(pgx.Tx)
	if !ok {
		// acquire a connection from the pool
		conn, err := p.acquireConn(ctx)
		if err != nil {
			return err
		}

		defer p.releaseConn(conn)

		return p.insertToYALCTables(ctx, conn.Exec, tableId, tableName, tableTitle, mm)
	}

	return p.insertToYALCTablesTx(ctx, tx, tableId, tableName, tableTitle, mm)
}

func (p *Pgx) insertToYALCTablesTx(
	ctx context.Context,
	tx pgx.Tx,
	tableId, tableName, tableTitle string,
	mm bool,
) error {
	return p.insertToYALCTables(ctx, tx.Exec, tableId, tableName, tableTitle, mm)
}

func (p *Pgx) insertToYALCTables(
	ctx context.Context,
	exec func(context.Context, string, ...interface{}) (pgconn.CommandTag, error),
	tableId, tableName, tableTitle string,
	mm bool,
) error {
	// insert the data to the table
	s := `INSERT INTO "yalc_tables" ("table_id", "table_name", "table_title", "mm") VALUES ($1, $2, $3, $4);`

	p.Logger.Debugf("inserting data: %s", s)

	_, err := exec(ctx, s, tableId, tableName, tableTitle, mm)

	if err != nil {
		return fmt.Errorf("failed to insert data: %v", err)
	}

	return nil
}

// Insert To YALC_cols
func (p *Pgx) InsertToYALCCols(
	ctx context.Context,
	tableId, colId, colName, colTitle string,
	colType domain.ColumnType,
) error {
	tx, ok := ctx.Value(TxCtx{}).(pgx.Tx)
	if !ok {
		// acquire a connection from the pool
		conn, err := p.acquireConn(ctx)
		if err != nil {
			return err
		}

		defer p.releaseConn(conn)

		return p.insertToYALCCols(ctx, conn.Exec, tableId, colId, colName, colTitle, colType)
	}

	return p.insertToYALCColsTx(ctx, tx, tableId, colId, colName, colTitle, colType)
}

func (p *Pgx) insertToYALCColsTx(
	ctx context.Context,
	tx pgx.Tx,
	tableId, colId, colName, colTitle string,
	colType domain.ColumnType,
) error {
	return p.insertToYALCCols(ctx, tx.Exec, tableId, colId, colName, colTitle, colType)
}

func (p *Pgx) insertToYALCCols(
	ctx context.Context,
	exec func(context.Context, string, ...interface{}) (pgconn.CommandTag, error),
	tableId, colId, colName, colTitle string,
	colType domain.ColumnType,
) error {
	// insert the data to the table
	s := `INSERT INTO "yalc_cols" ("table_id", "col_id", "col_name", "col_title", "type") VALUES ($1, $2, $3, $4, $5);`

	p.Logger.Debugf("inserting data: %s", s)

	colTitlePgVal := pgtype.Text{
		String: colTitle,
		Valid:  colTitle != "",
	}

	_, err := exec(ctx, s, tableId, colId, colName, colTitlePgVal, colType)

	if err != nil {
		return fmt.Errorf("failed to insert data: %v", err)
	}

	return nil
}

// LookupTableInfo looks up the table info from the database `yalc_tables` and `yalc_cols`
func (p *Pgx) LookupTableInfo(
	ctx context.Context,
	tableId string,
) (*domain.Table, error) {

	tx, ok := ctx.Value(TxCtx{}).(pgx.Tx)
	if !ok {

		// acquire a connection from the pool
		conn, err := p.acquireConn(ctx)
		if err != nil {
			return nil, err
		}
		defer p.releaseConn(conn)

		return p.lookupTableInfo(ctx, conn.Query, tableId)
	}

	return p.lookupTableInfoTx(ctx, tx, tableId)
}

func (p *Pgx) lookupTableInfoTx(
	ctx context.Context,
	tx pgx.Tx,
	tableId string,
) (*domain.Table, error) {
	return p.lookupTableInfo(ctx, tx.Query, tableId)
}

func (p *Pgx) lookupTableInfo(
	ctx context.Context,
	queryFn func(ctx context.Context, sql string, args ...any) (pgx.Rows, error),
	tableId string,
) (*domain.Table, error) {
	// get the table data
	rows, err := queryFn(
		ctx,
		`SELECT 
			"table_id",
			"table_name",
			"table_title"
		FROM "yalc_tables" WHERE "table_id" = $1;`,
		tableId,
	)
	if err != nil {
		p.Logger.Errorf("failed to get table data: %v", err)
		return nil, err
	}
	defer rows.Close()

	table := &domain.Table{
		Columns: []domain.Column{},
	}
	for rows.Next() {
		if err := rows.Scan(&table.TID, &table.Name, &table.Label); err != nil {
			p.Logger.Errorf("failed to scan table data: %v", err)
			return nil, err
		}
	}

	// get the columns data
	rows, err = queryFn(
		ctx,
		`SELECT 
			"col_id",
			"col_name",
			"col_title",
			"type"
		FROM "yalc_cols" WHERE "table_id" = $1;`,
		tableId,
	)
	if err != nil {
		p.Logger.Errorf("failed to get table data: %v", err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		col := &domain.Column{}
		var colLabelNull pgtype.Text

		if err := rows.Scan(&col.Id, &col.Name, &colLabelNull, &col.Type); err != nil {
			p.Logger.Errorf("failed to scan column data: %v", err)
			return nil, err
		}

		if colLabelNull.Valid {
			col.Label = colLabelNull.String
		} else {
			col.Label = ""
		}

		table.Columns = append(table.Columns, *col)
	}

	return table, nil

	//		SELECT
	//	   t."table_id",
	//	   t."table_name",
	//	   t."table_title",
	//	   c."col_id",
	//	   c."col_name",
	//	   c."col_title",
	//	   c."col_type"
	//
	// FROM
	//
	//	"yalc_tables" t
	//
	// LEFT JOIN
	//
	//	"yalc_cols" c ON t."table_id" = c."table_id"
	//
	// WHERE
	//
	//	t."table_id" = $1;
}

// Add New Column To Table
func (p *Pgx) AddNewColumnToTable(
	ctx context.Context,
	table *domain.Table,
	col domain.Column,
) (*domain.Column, error) {
	tx, ok := ctx.Value(TxCtx{}).(pgx.Tx)
	if !ok {

		// acquire a connection from the pool
		conn, err := p.acquireConn(ctx)
		if err != nil {
			return nil, err
		}
		defer p.releaseConn(conn)

		return p.addNewColumnToTable(ctx, conn.Exec, table, col)
	}

	return p.addNewColumnToTableTx(ctx, tx, table, col)
}

func (p *Pgx) addNewColumnToTableTx(
	ctx context.Context,
	tx pgx.Tx,
	table *domain.Table,
	col domain.Column,
) (*domain.Column, error) {
	return p.addNewColumnToTable(ctx, tx.Exec, table, col)
}

func (p *Pgx) addNewColumnToTable(
	ctx context.Context,
	exec func(context.Context, string, ...interface{}) (pgconn.CommandTag, error),
	table *domain.Table,
	col domain.Column,
) (*domain.Column, error) {
	colName := shared.NormalizeStringForPostgres(col.Label)
	// insert the data to the table
	s := `ALTER TABLE "{tableName}" ADD COLUMN "{colName}" {colType};`
	s = strings.Replace(s, "{tableName}", table.Name, -1)
	s = strings.Replace(s, "{colName}", colName, -1)
	s = strings.Replace(s, "{colType}", shared.ColumnToPostgresType(&col.Type), -1)

	p.Logger.Debugf("altering table: %s", s)

	_, err := exec(ctx, s)

	if err != nil {
		return nil, fmt.Errorf("failed to alter table: %v", err)
	}

	newCol := &domain.Column{
		Id:    shared.GenerateColumnId(),
		Name:  colName,
		Type:  col.Type,
		Label: col.Label,
	}

	// insert to `yalc_cols`
	err = p.InsertToYALCCols(
		ctx,
		table.TID,
		newCol.Id,
		newCol.Name,
		newCol.Label,
		newCol.Type,
	)
	if err != nil {
		return nil, err
	}

	// append the new column to the table
	table.Columns = append(table.Columns, *newCol)

	return newCol, nil
}

// Create MM Link Table
func (p *Pgx) CreateMMLinkTable(
	ctx context.Context,
	table1, table2 domain.Table,
) (*domain.Table, error) {
	tx, ok := ctx.Value(TxCtx{}).(pgx.Tx)
	if !ok {

		// acquire a connection from the pool
		conn, err := p.acquireConn(ctx)
		if err != nil {
			return nil, err
		}
		defer p.releaseConn(conn)

		return p.createMMLinkTable(ctx, conn.Exec, table1, table2)
	}

	return p.createMMLinkTableTx(ctx, tx, table1, table2)
}

func (p *Pgx) createMMLinkTableTx(
	ctx context.Context,
	tx pgx.Tx,
	table1, table2 domain.Table,
) (*domain.Table, error) {
	return p.createMMLinkTable(ctx, tx.Exec, table1, table2)
}

func (p *Pgx) createMMLinkTable(
	ctx context.Context,
	exec func(context.Context, string, ...interface{}) (pgconn.CommandTag, error),
	table1, table2 domain.Table,
) (*domain.Table, error) {
	// create a new table `yalc_mm_<id>`
	mmTableName := shared.GenerateMMTableName(table1.Name, table2.Name)

	s := `CREATE TABLE "{tableName}" (
		"{tableName1}_id" INTEGER NOT NULL,
		"{tableName2}_id" INTEGER NOT NULL,
		PRIMARY KEY ("{tableName1}_id", "{tableName2}_id"),
		FOREIGN KEY ("{tableName1}_id") REFERENCES "{tableName1}" ("id"),
		FOREIGN KEY ("{tableName2}_id") REFERENCES "{tableName2}" ("id")
	);`
	s = strings.Replace(s, "{tableName}", mmTableName, -1)
	s = strings.Replace(s, "{tableName1}", table1.Name, -1)
	s = strings.Replace(s, "{tableName2}", table2.Name, -1)

	p.Logger.Debugf("creating table: %s", s)

	_, err := exec(ctx, s)

	if err != nil {
		return nil, fmt.Errorf("failed to create table: %v", err)
	}

	table := &domain.Table{
		TID:  shared.GenerateTableId(),
		Name: mmTableName,
	}

	// insert to `yalc_tables` and `yalc_cols`
	err = p.InsertToYALCTables(
		ctx,
		table.TID,
		table.Name,
		table.Label,
		true,
	)
	if err != nil {
		return nil, err
	}

	col1Id := shared.GenerateColumnId()
	col2Id := shared.GenerateColumnId()

	// insert to `yalc_cols`
	err = p.InsertToYALCCols(
		ctx,
		table.TID,
		col1Id,
		fmt.Sprintf("%s_id", table1.Name),
		"",
		domain.ColumnTypeForeignKey,
	)

	if err != nil {
		return nil, err
	}

	err = p.InsertToYALCCols(
		ctx,
		table.TID,
		col2Id,
		fmt.Sprintf("%s_id", table2.Name),
		"",
		domain.ColumnTypeForeignKey,
	)

	if err != nil {
		return nil, err
	}

	// append the new column to the table
	table.Columns = append(table.Columns, domain.Column{
		Id:   col1Id,
		Name: fmt.Sprintf("%s_id", table1.Name),
		Type: domain.ColumnTypeForeignKey,
	})

	table.Columns = append(table.Columns, domain.Column{
		Id:   col2Id,
		Name: fmt.Sprintf("%s_id", table2.Name),
		Type: domain.ColumnTypeForeignKey,
	})

	return table, nil
}

// AddColumnRelation
func (p *Pgx) AddColumnRelation(
	ctx context.Context,
	addedCol domain.Column,
	table domain.Table,
	linkedCol domain.Column,
	linkedTable domain.Table,
	mmTable *domain.Table,
) error {
	tx, ok := ctx.Value(TxCtx{}).(pgx.Tx)
	if !ok {
		// acquire a connection from the pool
		conn, err := p.acquireConn(ctx)
		if err != nil {
			return err
		}
		defer p.releaseConn(conn)

		return p.addColumnRelation(ctx, conn.Exec, addedCol, table, linkedCol, linkedTable, mmTable)
	}

	return p.addColumnRelationTx(ctx, tx, addedCol, table, linkedCol, linkedTable, mmTable)
}

func (p *Pgx) addColumnRelationTx(
	ctx context.Context,
	tx pgx.Tx,
	addedCol domain.Column,
	table domain.Table,
	linkedCol domain.Column,
	linkedTable domain.Table,
	mmTable *domain.Table,
) error {
	return p.addColumnRelation(ctx, tx.Exec, addedCol, table, linkedCol, linkedTable, mmTable)
}

func (p *Pgx) addColumnRelation(
	ctx context.Context,
	exec func(context.Context, string, ...interface{}) (pgconn.CommandTag, error),
	addedCol domain.Column,
	table domain.Table,
	linkedCol domain.Column,
	linkedTable domain.Table,
	mmTable *domain.Table,
) error {
	// insert to `yalc_col_relations`
	s := `INSERT INTO "yalc_col_relations" (
		"link_col_id",
		"table_id", 
		"fk_child_col_id",
		"fk_parent_col_id", 
		"mm_table_id",
		"fk_mm_child_col_id",
		"fk_mm_parent_col_id"
		) VALUES ($1, $2, $3, $4, $5, $6, $7);`

	linkColId := addedCol.Id
	tableId := table.TID
	fkChildColId := linkedCol.Id
	fkParentColId := addedCol.Id
	mmTableId := mmTable.TID
	var fkMMChildColId, fkMMParentColId string

	for _, col := range mmTable.Columns {
		if col.Name == fmt.Sprintf("%s_id", table.Name) {
			fkMMParentColId = col.Id
		}
		if col.Name == fmt.Sprintf("%s_id", linkedTable.Name) {
			fkMMChildColId = col.Id
		}
	}

	if fkMMChildColId == "" || fkMMParentColId == "" {
		return fmt.Errorf("failed to get mm column ids")
	}

	_, err := exec(ctx, s, linkColId, tableId, fkChildColId, fkParentColId, mmTableId, fkMMChildColId, fkMMParentColId)
	if err != nil {
		return fmt.Errorf("failed to insert data: %v", err)
	}

	return nil
}

// / For each link column, we return the id array of the linked table
type LinkColumnData struct {
	Count       int   `json:"count"`
	ChildrenIds []int `json:"children_ids"`
}

func (p *Pgx) GetLinkColumnData(
	c context.Context,
	linkCol domain.Column,
	parentId int,
) (*LinkColumnData, error) {
	tx, ok := c.Value(TxCtx{}).(pgx.Tx)
	if !ok {
		// acquire a connection from the pool
		conn, err := p.acquireConn(c)
		if err != nil {
			return nil, err
		}
		defer p.releaseConn(conn)

		return p.getLinkColumnData(c, conn.Query, linkCol, parentId)
	}

	return p.getLinkColumnDataTx(c, tx, linkCol, parentId)
}

func (p *Pgx) getLinkColumnDataTx(
	c context.Context,
	tx pgx.Tx,
	linkCol domain.Column,
	parentId int,
) (*LinkColumnData, error) {
	return p.getLinkColumnData(c, tx.Query, linkCol, parentId)
}

// return a map of parent id to linked id
func (p *Pgx) getLinkColumnData(
	c context.Context,
	query func(context.Context, string, ...interface{}) (pgx.Rows, error),
	linkCol domain.Column,
	parentId int,
) (*LinkColumnData, error) {

	// get the mm link table and query based on the parenr ids

	mmLookUp, err := query(
		c,
		`SELECT mm_table_id, fk_mm_child_col_id, fk_mm_parent_col_id FROM yalc_col_relations WHERE link_col_id = $1`,
		linkCol.Id,
	)

	if err != nil {
		p.Logger.Errorf("failed to get mm link table: %v", err)
		return nil, err
	}

	var mmTableId, fkMMChildColId, fkMMParentColId string
	for mmLookUp.Next() {
		if err := mmLookUp.Scan(&mmTableId, &fkMMChildColId, &fkMMParentColId); err != nil {
			p.Logger.Errorf("failed to scan mm link table: %v", err)
			return nil, err
		}
	}

	mmTable, err := p.LookupTableInfo(c, mmTableId)
	if err != nil {
		p.Logger.Errorf("failed to get mm link table info: %v", err)
		return nil, err
	}

	//intArray := &pgtype.Array[int]{}
	//intArray.Elements = parentIds
	//intArray.Valid = true

	// get the mm link table data
	fkMMParentColName, err := p.LookUpColumnName(c, fkMMParentColId)
	if err != nil {
		p.Logger.Errorf("failed to get mm link table parent column name: %v", err)
		return nil, err
	}

	fkMMChildColName, err := p.LookUpColumnName(c, fkMMChildColId)
	if err != nil {
		p.Logger.Errorf("failed to get mm link table child column name: %v", err)
		return nil, err
	}

	rows, err := query(
		c,
		fmt.Sprintf(`SELECT %s FROM %s WHERE %s = $1;`, fkMMChildColName, mmTable.Name, fkMMParentColName),
		parentId,
	)
	if err != nil {
		p.Logger.Errorf("failed to get mm link table data: %v", err)
		return nil, err
	}

	defer rows.Close()

	data := make([]int, 0)
	//for rows.Next() {
	//	var id int
	//	var linkedId string
	//	if err := rows.Scan(&id, &linkedId); err != nil {
	//		return nil, err
	//	}
	//	// append the linked id to the data if more than one child	id
	//	if _, ok := data[id]; !ok {
	//		data[id] = []int{}
	//	}
	//	linkedIdInt, err := strconv.Atoi(linkedId)
	//	if err != nil {
	//		return nil, err
	//	}
	//	data[id] = append(data[id], linkedIdInt)
	//}

	for rows.Next() {
		var linkedId int
		if err := rows.Scan(&linkedId); err != nil {
			p.Logger.Errorf("failed to scan mm link table data: %v", err)
			return nil, err
		}
		data = append(data, linkedId)
	}

	return &LinkColumnData{
		Count:       len(data),
		ChildrenIds: data,
	}, nil
}

func (p *Pgx) UpdateDataColumn(
	c context.Context,
	tableName string,
	column domain.Column,
	rowId int,
	value any,
) error {
	tx, ok := c.Value(TxCtx{}).(pgx.Tx)
	if !ok {
		// acquire a connection from the pool
		conn, err := p.acquireConn(c)
		if err != nil {
			return err
		}
		defer p.releaseConn(conn)

		return p.updateDataColumn(c, conn.Exec, tableName, column, rowId, value)
	}

	return p.updateDataColumnTx(c, tx, tableName, column, rowId, value)
}

func (p *Pgx) updateDataColumnTx(
	c context.Context,
	tx pgx.Tx,
	tableName string,
	column domain.Column,
	rowId int,
	value any,
) error {
	return p.updateDataColumn(c, tx.Exec, tableName, column, rowId, value)
}

func (p *Pgx) updateDataColumn(
	c context.Context,
	exec func(context.Context, string, ...interface{}) (pgconn.CommandTag, error),
	tableName string,
	column domain.Column,
	rowId int,
	value any,
) error {

	var valuePg any
	var err error
	valueStr := parseValueToString(value)
	if valueStr == "" {
		// if empty string, set to null
		valuePg = shared.ParseNullOperatorV2(column.Type)
	} else {
		valuePg, err = shared.ParseValue(column.Type, valueStr)
		if err != nil {
			p.Logger.Errorf("failed to parse value: %v", err)
			return fmt.Errorf("failed to parse value: %v", err)
		}
	}

	// update the data in the table
	s := fmt.Sprintf(`UPDATE "%s" SET "%s" = $1 WHERE "id" = $2;`, tableName, column.Name)

	p.Logger.Debugf("updating data: %s", s)

	_, err = exec(c, s, valuePg, rowId)
	if err != nil {
		p.Logger.Errorf("failed to update data: %v", err)
		return fmt.Errorf("failed to update data: %v", err)
	}

	return nil
}

func (p *Pgx) UpdateLinkColumn(
	c context.Context,
	tableName, columnId string,
	parentId int,
	childIds []int,
) error {
	tx, ok := c.Value(TxCtx{}).(pgx.Tx)
	if !ok {
		// acquire a connection from the pool
		conn, err := p.acquireConn(c)
		if err != nil {
			return err
		}
		defer p.releaseConn(conn)

		return p.updateLinkColumn(
			c,
			conn.Exec,
			conn.Query,
			tableName,
			columnId,
			parentId,
			childIds,
		)
	}

	return p.updateLinkColumnTx(c, tx, tableName, columnId, parentId, childIds)
}

func (p *Pgx) updateLinkColumnTx(
	c context.Context,
	tx pgx.Tx,
	tableName, columnId string,
	parentId int,
	childIds []int,
) error {
	return p.updateLinkColumn(c, tx.Exec, tx.Query, tableName, columnId, parentId, childIds)
}

func (p *Pgx) updateLinkColumn(
	c context.Context,
	exec func(context.Context, string, ...interface{}) (pgconn.CommandTag, error),
	query func(context.Context, string, ...interface{}) (pgx.Rows, error),
	tableName, columnId string,
	parentId int,
	childIds []int,
) error {

	// get the mm link table
	mmLookUp, err := query(
		c,
		`SELECT mm_table_id, fk_mm_child_col_id, fk_mm_parent_col_id FROM yalc_col_relations WHERE link_col_id = $1`,
		columnId,
	)
	if err != nil {
		p.Logger.Errorf("failed to get mm link table: %v", err)
		return err
	}

	var mmTableId, fkMMChildColId, fkMMParentColId string

	for mmLookUp.Next() {
		if err := mmLookUp.Scan(&mmTableId, &fkMMChildColId, &fkMMParentColId); err != nil {
			p.Logger.Errorf("failed to scan mm link table: %v", err)
			return err
		}
	}

	mmLookUp.Close()

	p.Logger.Debugf("mmTableId: %s, fkMMChildColId: %s, fkMMParentColId: %s", mmTableId, fkMMChildColId, fkMMParentColId)

	mmTable, err := p.LookupTableInfo(c, mmTableId)
	if err != nil {
		p.Logger.Errorf("failed to get mm link table info: %v", err)
		return err
	}

	parentColName, err := p.LookUpColumnName(c, fkMMParentColId)
	if err != nil {
		p.Logger.Errorf("failed to get mm link table parent column name: %v", err)
		return err
	}

	childColName, err := p.LookUpColumnName(c, fkMMChildColId)
	if err != nil {
		p.Logger.Errorf("failed to get mm link table child column name: %v", err)
		return err
	}

	// delete all the child ids
	s := fmt.Sprintf(`DELETE FROM %s WHERE %s = $1;`, mmTable.Name, parentColName)

	p.Logger.Debugf("deleting data: %s, parentId: %v", s, parentId)

	_, err = exec(c, s, parentId)

	if err != nil {
		p.Logger.Errorf("failed to delete data: %v", err)
		return fmt.Errorf("failed to delete data: %v", err)
	}

	// insert the new child ids
	s = fmt.Sprintf(`INSERT INTO %s (%s, %s) VALUES ($1, $2);`, mmTable.Name, parentColName, childColName)

	p.Logger.Debugf("inserting data: %s, parentId: %v, childIds: %v", s, parentId, childIds)

	for _, childId := range childIds {
		_, err = exec(c, s, parentId, childId)
		if err != nil {
			p.Logger.Errorf("failed to insert data: %v", err)
			return fmt.Errorf("failed to insert data: %v", err)
		}
	}

	return nil

}

// Look up column name in `yalc_cols`
func (p *Pgx) LookUpColumnName(
	c context.Context,
	columnId string,
) (string, error) {
	tx, ok := c.Value(TxCtx{}).(pgx.Tx)
	if !ok {
		// acquire a connection from the pool
		conn, err := p.acquireConn(c)
		if err != nil {
			return "", err
		}
		defer p.releaseConn(conn)

		return p.lookUpColumnName(c, conn.Query, columnId)
	}

	return p.lookUpColumnNameTx(c, tx, columnId)
}

func (p *Pgx) lookUpColumnNameTx(
	c context.Context,
	tx pgx.Tx,
	columnId string,
) (string, error) {
	return p.lookUpColumnName(c, tx.Query, columnId)
}

func (p *Pgx) lookUpColumnName(
	c context.Context,
	query func(context.Context, string, ...interface{}) (pgx.Rows, error),
	columnId string,
) (string, error) {
	rows, err := query(
		c,
		`SELECT "col_name" FROM "yalc_cols" WHERE "col_id" = $1;`,
		columnId,
	)
	if err != nil {
		return "", err
	}

	var colName string
	for rows.Next() {
		if err := rows.Scan(&colName); err != nil {
			return "", err
		}
	}

	return colName, nil
}

func (p *Pgx) InsertToYALCColRelations(
	c context.Context,
	linkColId, tableId, fkChildColId, fkParentColId, mmTableId, fkMMChildColId, fkMMParentColId string,
) error {
	tx, ok := c.Value(TxCtx{}).(pgx.Tx)
	if !ok {
		// acquire a connection from the pool
		conn, err := p.acquireConn(c)
		if err != nil {
			return err
		}
		defer p.releaseConn(conn)

		return p.insertToYALCColRelations(
			c,
			conn.Exec,
			linkColId,
			tableId,
			fkChildColId,
			fkParentColId,
			mmTableId,
			fkMMChildColId,
			fkMMParentColId,
		)
	}

	return p.insertToYALCColRelationsTx(
		c,
		tx,
		linkColId,
		tableId,
		fkChildColId,
		fkParentColId,
		mmTableId,
		fkMMChildColId,
		fkMMParentColId,
	)
}

func (p *Pgx) insertToYALCColRelationsTx(
	c context.Context,
	tx pgx.Tx,
	linkColId, tableId, fkChildColId, fkParentColId, mmTableId, fkMMChildColId, fkMMParentColId string,
) error {
	return p.insertToYALCColRelations(
		c,
		tx.Exec,
		linkColId,
		tableId,
		fkChildColId,
		fkParentColId,
		mmTableId,
		fkMMChildColId,
		fkMMParentColId,
	)
}

func (p *Pgx) insertToYALCColRelations(
	c context.Context,
	exec func(context.Context, string, ...interface{}) (pgconn.CommandTag, error),
	linkColId, tableId, fkChildColId, fkParentColId, mmTableId, fkMMChildColId, fkMMParentColId string,
) error {
	// insert the data to the table
	s := `INSERT INTO "yalc_col_relations" (
		"link_col_id",
		"link_table_id", 
		"fk_child_col_id",
		"fk_parent_col_id", 
		"mm_table_id",
		"fk_mm_child_col_id",
		"fk_mm_parent_col_id"
		) VALUES ($1, $2, $3, $4, $5, $6, $7);`

	_, err := exec(c, s, linkColId, tableId, fkChildColId, fkParentColId, mmTableId, fkMMChildColId, fkMMParentColId)
	if err != nil {
		return fmt.Errorf("failed to insert data: %v", err)
	}

	return nil
}

func (p *Pgx) GetPKColumn(
	c context.Context,
	tableId string,
) (*domain.Column, error) {
	tx, ok := c.Value(TxCtx{}).(pgx.Tx)
	if !ok {
		// acquire a connection from the pool
		conn, err := p.acquireConn(c)
		if err != nil {
			return nil, err
		}
		defer p.releaseConn(conn)

		return p.getPKColumn(c, conn.Query, tableId)
	}

	return p.getPKColumnTx(c, tx, tableId)
}

func (p *Pgx) getPKColumnTx(
	c context.Context,
	tx pgx.Tx,
	tableId string,
) (*domain.Column, error) {
	return p.getPKColumn(c, tx.Query, tableId)
}

func (p *Pgx) getPKColumn(
	c context.Context,
	query func(context.Context, string, ...interface{}) (pgx.Rows, error),
	tableId string,
) (*domain.Column, error) {
	rows, err := query(
		c,
		`SELECT col_id, col_name, col_title, type FROM "yalc_cols" WHERE "table_id" = $1 AND "type" = $2;`,
		tableId,
		domain.ColumnTypePrimaryKey,
	)

	if err != nil {
		return nil, err
	}

	result := &domain.Column{}

	for rows.Next() {
		if err := rows.Scan(&result.Id, &result.Name, &result.Label, &result.Type); err != nil {
			return nil, err
		}
	}

	return result, nil
}
