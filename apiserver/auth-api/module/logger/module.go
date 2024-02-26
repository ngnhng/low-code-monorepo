package logger

import (
	"yalc/auth-service/shared/constant"

	"go.uber.org/fx"
)

var Module = fx.Module(
	constant.LOGGER_MODULE,
	fx.Provide(
		fx.Annotate(
			NewZapLogger,
			fx.As(new(Logger)),
		),
	),
)
