package repository

import (
	"yalc/auth-service/repository/token"

	"go.uber.org/fx"
)

var Module = fx.Options(
	fx.Provide(
		fx.Annotate(
			token.NewRedisTokenRepository,
			fx.As(new(TokenRepository)),
		),
	),
)
