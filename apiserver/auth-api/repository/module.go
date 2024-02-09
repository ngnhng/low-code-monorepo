package repository

import (
	"yalc/auth-service/module/database/redis"
	"yalc/auth-service/repository/token"

	"go.uber.org/fx"
)

var Module = fx.Options(
	fx.Provide(
		NewTokenRepository,
	),
)

type (
	Param struct {
		fx.In

		RedisClient *redis.RedisClient
	}
)

func NewTokenRepository(p Param) TokenRepository {
	return token.NewRedisTokenRepository(p.RedisClient.Client)
}
