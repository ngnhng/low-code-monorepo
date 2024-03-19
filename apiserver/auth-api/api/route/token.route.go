package route

import (
	tokenController "yalc/auth-service/api/controller/token"
	"yalc/auth-service/module/config"
	"yalc/auth-service/module/httpserver"

	"github.com/labstack/echo/v4"
)

// Each sub-group will require a new router such as this one
func NewTokenStoreAccessRouterV1(
	cfg *config.Config,
	builder *httpserver.EchoRouteBuilder,
	controller *tokenController.TokenStoreAccessController,
) {
	builder.
		AddGroup("/v1/access_token",
			func(g *echo.Group) {
				g.GET("/google", controller.GetOauthAccessToken)
			},
		)
}
