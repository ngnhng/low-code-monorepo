package config

import (
	"os"

	"go.uber.org/fx"

	env "github.com/caarlos0/env/v10"
	dotenv "github.com/joho/godotenv"
)

var Module = fx.Module(
	"config",
	fx.Provide(NewConfig),
)

func NewConfig() (*Config, error) {
	dotenv.Load(os.Getenv("YALC_ENV_FILE"))

	cfg := &Config{}
	if err := env.ParseWithOptions(cfg, env.Options{
		Prefix:          Prefix,
		RequiredIfNoDef: true,
	}); err != nil {
		panic(err)
	}
	return cfg, nil
}
