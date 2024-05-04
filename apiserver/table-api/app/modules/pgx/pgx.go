package pgx

import (
	"context"
	"fmt"
	"time"
	"yalc/dbms/modules/config"
	"yalc/dbms/modules/logger"
	"yalc/dbms/shared"

	lru "github.com/hashicorp/golang-lru/v2"

	"github.com/jackc/pgx/v5/pgxpool"
	"go.uber.org/fx"
)

const (
	healthCheckPeriod = 1 * time.Minute
	maxConnIdleTime   = 1 * time.Minute
	maxConnLifetime   = 3 * time.Minute
	minConns          = 2
	maxPoolSize       = 10
)

type (
	// global manager for managing multiple database connection pools
	PgxManager struct {
		// in-memory cache for storing connection pools
		ConnPoolMap *lru.Cache[string, *Pgx]

		// user db pool -- this is a special pool for user database
		UserDbPool *UserDbPgxPool

		Config *config.Config
		Logger logger.Logger
	}

	PgxParams struct {
		fx.In

		Config *config.Config
		Logger logger.Logger
	}
)

func NewPgxManager(p PgxParams) (*PgxManager, error) {

	cache, err := lru.New[string, *Pgx](maxPoolSize)
	if err != nil {
		return nil, err
	}

	return &PgxManager{
		ConnPoolMap: cache,
		Config:      p.Config,
		Logger:      p.Logger,
	}, nil
}

// NewPgxPool create a new Pgx connection pool and add it to the PgxPool if it doesn't exist
func (pg *PgxManager) NewPgxPool(db string) (*Pgx, error) {
	if _, ok := pg.ConnPoolMap.Get(db); ok {
		pg.Logger.Debug("pgx pool for db %s already exists", db)
		return nil, fmt.Errorf("pgx pool for db %s already exists", db)
	}

	poolCfg, err := pgxpool.ParseConfig(
		fmt.Sprintf(
			"user=%s password=%s host=%s port=%s dbname=%s sslmode=require",
			pg.Config.Database.Postgres.User,
			pg.Config.Database.Postgres.Password,
			pg.Config.Database.Postgres.Host,
			pg.Config.Database.Postgres.Port,
			db,
		),
	)
	if err != nil {
		return nil, err
	}

	poolCfg.HealthCheckPeriod = healthCheckPeriod
	poolCfg.MaxConnIdleTime = maxConnIdleTime
	poolCfg.MaxConnLifetime = maxConnLifetime
	poolCfg.MinConns = minConns
	poolCfg.AfterConnect = shared.RegisterDecimalType

	pool, err := pgxpool.NewWithConfig(context.Background(), poolCfg)
	if err != nil {
		return nil, err
	}

	pgx := &Pgx{
		ConnPool: pool,
		Logger:   pg.Logger,
	}

	pg.ConnPoolMap.Add(db, pgx)

	return pgx, nil
}

// GetPgxPool get the Pgx connection pool for the given db
func (pg *PgxManager) GetPgxPool(db string) (*Pgx, error) {
	if v, ok := pg.ConnPoolMap.Get(db); ok {
		return v, nil
	}
	pg.Logger.Debugf("pgx pool for db %s not found", db)
	return nil, fmt.Errorf("pgx pool for db %s not found", db)
}

// GetOrCreatePgxPool get the Pgx connection pool for the given db, if it doesn't exist, create a new one
func (pg *PgxManager) GetOrCreatePgxPool(db string) (*Pgx, error) {
	if v, ok := pg.ConnPoolMap.Get(db); ok {
		pg.Logger.Debugf("pgx pool for db %s already exists", db)
		return v, nil
	}

	pg.Logger.Debugf("pgx pool for db %s not found, creating a new one", db)

	return pg.NewPgxPool(db)
}

// GetOrCreateUserPgxPool get the Pgx connection pool for the user database, if it doesn't exist, create a new one
func (pg *PgxManager) GetOrCreateUserPgxPool() (*UserDbPgxPool, error) {
	if pg.UserDbPool != nil {
		pg.Logger.Debug("user db pool already exists")
		return pg.UserDbPool, nil
	}

	pg.Logger.Debug("user db pool not found, creating a new one")

	poolCfg, err := pgxpool.ParseConfig(
		fmt.Sprintf(
			"user=%s password=%s host=%s port=%s dbname=%s sslmode=require",
			pg.Config.Database.Postgres.User,
			pg.Config.Database.Postgres.Password,
			pg.Config.Database.Postgres.Host,
			pg.Config.Database.Postgres.Port,
			pg.Config.Database.Postgres.UserDatabase,
		),
	)
	if err != nil {
		return nil, err
	}

	ctx := context.Background()

	poolCfg.HealthCheckPeriod = healthCheckPeriod
	poolCfg.MaxConnIdleTime = maxConnIdleTime
	poolCfg.MaxConnLifetime = maxConnLifetime
	poolCfg.MinConns = minConns
	poolCfg.AfterConnect = shared.RegisterDecimalType

	pool, err := pgxpool.NewWithConfig(ctx, poolCfg)
	if err != nil {
		return nil, err
	}

	pg.UserDbPool = &UserDbPgxPool{
		ConnPool: pool,
		Logger:   pg.Logger,
	}

	return pg.UserDbPool, nil
}
