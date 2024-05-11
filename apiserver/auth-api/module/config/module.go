package config

import (
	"os"
	"yalc/auth-service/shared/constant"

	env "github.com/caarlos0/env/v10"
	dotenv "github.com/joho/godotenv"
	"go.uber.org/fx"
)

var Module = fx.Module(
	constant.CONFIG_MODULE,
	fx.Provide(NewConfig),
)

func NewConfig() (*Config, error) {
	dotenv.Load(os.Getenv("YALC_ENV_FILE"))
	// if no path is set, still continue

	cfg := &Config{
		Env: &Env{},
	}
	if err := env.ParseWithOptions(cfg.Env, env.Options{
		Prefix:          Prefix,
		RequiredIfNoDef: true,
	}); err != nil {
		panic(err)
	}
	return cfg, nil
}
