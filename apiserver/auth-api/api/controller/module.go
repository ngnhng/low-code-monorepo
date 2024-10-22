package controller

import (
	"yalc/auth-service/module/config"
	"yalc/auth-service/module/logger"
	"yalc/auth-service/module/oauth2"
	"yalc/auth-service/usecase"

	google_oauth "yalc/auth-service/api/controller/oauth"
	"yalc/auth-service/api/controller/token"

	"go.uber.org/fx"
)

var Module = fx.Module(
	"controller",
	fx.Provide(
		NewOauthController,
		token.NewTokenStoreAccessController,
	),
)

type (
	Params struct {
		fx.In

		Configs             *config.Config
		Logger              logger.Logger
		GoogleOAuthUsecase  *usecase.GoogleOAuthLoginUsecase
		GoogleOAuthProvider *oauth2.GoogleProvider
	}

	Result struct {
		fx.Out

		GoogleOauth *google_oauth.GoogleOAuthLoginController
	}
)

// Provide your controller implementations here.
func NewOauthController(p Params) Result {
	//return fx.Provide(
	//	adminLoginController.New,
	//	registerController.New,
	//)

	googleOauthLoginController := google_oauth.NewGoogleOAuthLoginController(
		p.GoogleOAuthUsecase,
		p.Configs,
		p.Logger,
		p.GoogleOAuthProvider,
	)

	return Result{
		GoogleOauth: googleOauthLoginController,
	}
}
