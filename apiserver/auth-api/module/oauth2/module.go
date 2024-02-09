package oauth2

import (
	"yalc/auth-service/module/config"

	"go.uber.org/fx"
)

func GetModule(cfg *config.Config) fx.Option {
	var opts []fx.Option

	if cfg.Env.OAuth2.Provider.Google.ClientID != "" {
		opts = append(opts, fx.Provide(NewGoogleProvider))
	}

	return fx.Options(opts...)
}
