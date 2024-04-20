package redis

import (
	"context"
	"fmt"
	"yalc/bpmn-engine/modules/config"

	redis "github.com/redis/go-redis/v9"
	"go.uber.org/fx"
)

type (
	RedisClient struct {
		Client *redis.Client
	}

	Param struct {
		fx.In

		config.Config
	}

	Result struct {
		fx.Out

		RedisClient *RedisClient
	}
)

func NewRedisClient(p Param) Result {
	dbConfig := p.Config.GetConfig().RedisDatabase
	return Result{
		RedisClient: &RedisClient{
			Client: redis.NewClient(&redis.Options{
				Addr:     dbConfig.Host + ":" + fmt.Sprintf("%v", dbConfig.Port),
				Password: dbConfig.Password,
				DB:       dbConfig.Db,
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
