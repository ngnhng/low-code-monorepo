package route

import (
	oauthLogin "yalc/auth-service/api/controller/oauth"
	"yalc/auth-service/api/controller/token"
	"yalc/auth-service/module/config"
	"yalc/auth-service/module/httpserver"

	"github.com/labstack/echo/v4"
	"go.uber.org/fx"
)

type (
	Params struct {
		fx.In

		Configs              *config.Config
		Server               httpserver.EchoHTTPServer
		OAuthController      *oauthLogin.GoogleOAuthLoginController
		TokenStoreController *token.TokenStoreAccessController
	}
)

func NewRouter(p Params) {
	// TODO: move this to config
	builder := p.Server.RouteBuilder()
	builder.
		AddGroup("/api", func(g *echo.Group) {
			// g is sub-group from builder
			NewAuthenticationRouterV1(p.Configs, &httpserver.EchoRouteBuilder{Builder: g}, p.OAuthController)
			NewTokenStoreAccessRouterV1(p.Configs, &httpserver.EchoRouteBuilder{Builder: g}, p.TokenStoreController)
		})
}
