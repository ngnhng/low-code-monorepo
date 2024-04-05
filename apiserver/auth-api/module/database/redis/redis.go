package redis

import (
	"context"
	"fmt"
	"yalc/auth-service/module/config"

	redis "github.com/redis/go-redis/v9"
	"go.uber.org/fx"
)

type (
	RedisClient struct {
		*redis.Client
	}

	Param struct {
		fx.In

		Conf *config.Config
	}

	Result struct {
		fx.Out

		RedisClient *RedisClient
	}
)

func NewRedisClient(p Param) Result {
	return Result{
		RedisClient: &RedisClient{
			Client: redis.NewClient(&redis.Options{
				Addr:     p.Conf.Database.Redis.Host + ":" + fmt.Sprintf("%v", p.Conf.Database.Redis.Port),
				Password: p.Conf.Database.Redis.Password,
				DB:       p.Conf.Database.Redis.Db,
			}),
		},
	}

}

func (c *RedisClient) Connect(ctx context.Context) error {
	_, err := c.Client.Ping(ctx).Result()
	return err
}

func (c *RedisClient) Close() error {
	return c.Client.Close()
}
