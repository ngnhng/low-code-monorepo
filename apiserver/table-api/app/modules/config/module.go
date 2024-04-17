package config

import (
	"fmt"

	"go.uber.org/fx"

	env "github.com/caarlos0/env/v10"
)

var Module = fx.Module(
	"config",
	fx.Options(
		fx.Provide(NewConfig),
	),
)

func NewConfig() (Config, error) {

	cfg := &Config{}
	if err := env.ParseWithOptions(cfg, env.Options{
		Prefix: Prefix,
	}); err != nil {
		return Config{}, err
	}
	fmt.Print(cfg)
	return *cfg, nil
}
