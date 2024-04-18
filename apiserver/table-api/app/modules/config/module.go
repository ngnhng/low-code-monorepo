package config

import (
	"fmt"
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
	err := dotenv.Load(os.Getenv("YALC_ENV_FILE"))
	if err != nil {
		panic(err)
	}

	cfg := &Config{}
	if err := env.ParseWithOptions(cfg, env.Options{
		Prefix:          Prefix,
		RequiredIfNoDef: true,
	}); err != nil {
		panic(err)
	}
	fmt.Println(cfg)
	return cfg, nil
}
