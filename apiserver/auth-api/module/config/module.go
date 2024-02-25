package config

import (
	"yalc/auth-service/shared/constant"

	"go.uber.org/fx"
)

var Module = fx.Module(
	constant.CONFIG_MODULE,
	fx.Provide(NewConfig),
)
