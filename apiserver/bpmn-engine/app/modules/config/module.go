package config

import (
	"os"

	"go.uber.org/fx"
)

var Module = fx.Module(
	"config",
	fx.Options(
		fx.Provide(NewConfig),
	),
)

func NewConfig() (Config, error) {
	env := os.Getenv("ENVIRONMENT")
	switch env {
	case "local":
		return NewLocalConfig()
	case "development":
		return NewDevConfig()
	case "production":
		return NewProdConfig()
	default:
		panic("Invalid environment: " + env)
	}
}
