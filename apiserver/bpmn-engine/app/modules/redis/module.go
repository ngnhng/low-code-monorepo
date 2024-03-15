package redis

import (
	"context"

	"go.uber.org/fx"
)

var Module = fx.Module(
	"redis-client",
	fx.Provide(NewRedisClient),
	fx.Invoke(registerHook),
)

func registerHook(lc fx.Lifecycle, db *RedisClient) {
	lc.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			return db.Connect(ctx)
		},
		OnStop: func(context.Context) error {
			return db.Close()
		},
	})
}
