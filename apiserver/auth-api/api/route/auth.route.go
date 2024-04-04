package route

import (
	oauthController "yalc/auth-service/api/controller/oauth"
	"yalc/auth-service/module/config"
	"yalc/auth-service/module/httpserver"
	"yalc/auth-service/shared/constant"

	"github.com/labstack/echo/v4"
)

// Each sub-group will require a new router such as this one
func NewAuthenticationRouterV1(
	cfg *config.Config,
	builder *httpserver.EchoRouteBuilder,
	controller *oauthController.GoogleOAuthLoginController,
) {
	builder.
		AddGroup("/v1"+constant.AUTHENTICATION_ROUTE_PREFIX,
			func(g *echo.Group) {
				g.GET("/google", controller.Login)
				g.GET("/google/callback", controller.Callback)
				// NewSubRouter(..., g, ...)
			},
		).
		AddGroup("/v1/validate",
			func(g *echo.Group) {
				g.GET("/token", controller.ValidateToken)
				g.POST("/token", controller.ValidateToken)
			},
		)
}
