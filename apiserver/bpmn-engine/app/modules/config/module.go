package config

import (
	"os"

	"go.uber.org/fx"

	env "github.com/caarlos0/env/v10"
	dotenv "github.com/joho/godotenv"
)

var Module = fx.Module(
	"config",
	fx.Provide(
		fx.Annotate(
			NewConfig,
			fx.As(new(Config)),
		),
	),
)

func NewConfig() (Config, error) {
	dotenv.Load(os.Getenv("YALC_ENV_FILE"))

	cfg := &config{
		env: &Env{},
	}
	if err := env.ParseWithOptions(cfg.env, env.Options{
		Prefix:          Prefix,
		RequiredIfNoDef: true,
	}); err != nil {
		panic(err)
	}
	return cfg, nil
}
