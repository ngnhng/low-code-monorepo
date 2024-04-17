package pgx

import (
	"context"
	"fmt"
	"time"
	"yalc/dbms/modules/config"
	"yalc/dbms/modules/logger"

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
		fmt.Sprintf("user=%s password=%s host=%s port=%d dbname=%s sslmode=require",
			pg.Config.Database.Postgres.User,
			pg.Config.Database.Postgres.Password,
			pg.Config.Database.Postgres.Host,
			pg.Config.Database.Postgres.Port,
			db),
	)
	if err != nil {
		return nil, err
	}

	poolCfg.HealthCheckPeriod = healthCheckPeriod
	poolCfg.MaxConnIdleTime = maxConnIdleTime
	poolCfg.MaxConnLifetime = maxConnLifetime
	poolCfg.MinConns = minConns

	pool, err := pgxpool.NewWithConfig(context.Background(), poolCfg)
	if err != nil {
		return nil, err
	}

	pgx := &Pgx{
		ConnPool: pool,
	}

	pg.ConnPoolMap.Add(db, pgx)

	return pgx, nil

}

// GetPgxPool get the Pgx connection pool for the given db
func (pg *PgxManager) GetPgxPool(db string) (*Pgx, error) {
	if v, ok := pg.ConnPoolMap.Get(db); ok {
		return v, nil
	}
	pg.Logger.Debug("pgx pool for db %s not found", db)
	return nil, fmt.Errorf("pgx pool for db %s not found", db)
}
