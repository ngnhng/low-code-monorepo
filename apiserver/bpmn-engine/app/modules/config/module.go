package config

import "go.uber.org/fx"

var Module = fx.Module(
	"config",
	fx.Options(
		fx.Provide(New),
	),
)
