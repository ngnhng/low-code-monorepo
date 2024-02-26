package controller

import (
	"yalc/auth-service/module/config"
	"yalc/auth-service/module/logger"
	"yalc/auth-service/usecase"

	google_oauth "yalc/auth-service/api/controller/oauth-login"

	"go.uber.org/fx"
)

var Module = fx.Module(
	"controller",
	fx.Provide(
		NewController,
	),
)

type (
	Params struct {
		fx.In

		Configs            *config.Config
		Logger             logger.Logger
		GoogleOAuthUsecase usecase.GoogleOAuthLoginUsecase
	}

	Result struct {
		fx.Out

		GoogleOauth *google_oauth.GoogleOAuthLoginController
	}
)

// Provide your controller implementations here.
func NewController(p Params) Result {
	//return fx.Provide(
	//	adminLoginController.New,
	//	registerController.New,
	//)

	googleOauthLoginController := google_oauth.NewGoogleOAuthLoginController(
		p.GoogleOAuthUsecase,
		p.Configs,
		p.Logger,
	)

	return Result{
		GoogleOauth: googleOauthLoginController,
	}
}
