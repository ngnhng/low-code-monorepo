package redis

import (
	"context"
	"strconv"
	"yalc/auth-service/module/config"
	"yalc/auth-service/module/logger"

	redis "github.com/redis/go-redis/v9"
	"go.uber.org/fx"
)

type (
	RedisClient struct {
		*redis.Client
		Logger logger.Logger
	}

	Param struct {
		fx.In

		Conf   *config.Config
		Logger logger.Logger
	}

	Result struct {
		fx.Out

		RedisClient *RedisClient
	}
)

func NewRedisClient(p Param) Result {
	db, err := strconv.Atoi(p.Conf.Repository.Token.Db)
	if err != nil {
		panic(err)
	}
	p.Logger.Debugf("Connecting to redis: %s", p.Conf.Repository.Token.Address)

	return Result{
		RedisClient: &RedisClient{
			Client: redis.NewClient(&redis.Options{
				Addr:     p.Conf.Repository.Token.Address,
				Password: p.Conf.Repository.Token.Password,
				DB:       db,
			}),
			Logger: p.Logger,
		},
	}
}

func (c *RedisClient) Connect(ctx context.Context) error {
	_, err := c.Client.Ping(ctx).Result()
	if err != nil {
		c.Logger.Debugf("Failed to connect to redis: %s", c.Client.Options().Addr)
		c.Logger.Error(err)
	}
	return err
}

func (c *RedisClient) Close() error {
	return c.Client.Close()
}
