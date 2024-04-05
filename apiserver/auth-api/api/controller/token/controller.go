package token

import (
	"yalc/auth-service/module/config"
	"yalc/auth-service/module/logger"
	"yalc/auth-service/usecase"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"go.uber.org/fx"
	//oauth2_module "yalc/auth-service/module/oauth2"
)

type (
	TokenStoreAccessController struct {
		Config  *config.Config
		Logger  logger.Logger
		UseCase *usecase.GetGoogleOAuthTokenUsecase

		//Provider *oauth2_module.GoogleProvider
	}

	Params struct {
		fx.In

		Config                     *config.Config
		Logger                     logger.Logger
		GetGoogleOAuthTokenUsecase *usecase.GetGoogleOAuthTokenUsecase
	}
)

func NewTokenStoreAccessController(p Params) *TokenStoreAccessController {
	return &TokenStoreAccessController{
		UseCase: p.GetGoogleOAuthTokenUsecase,
		Config:  p.Config,
		Logger:  p.Logger,
		//Provider:                   p.Provider,
	}
}

// GetOauthAccessToken returns the access token from the token store
func (ctrl *TokenStoreAccessController) GetOauthAccessToken(c echo.Context) error {
	user := c.Get("user").(*jwt.Token)
	email := user.Claims.(jwt.MapClaims)["email"].(string)
	token, err := ctrl.UseCase.GetAccessToken(c.Request().Context(), email)
	if err != nil {
		// TODO: logic to handle cases where stored refresh token is invalid
		// and user needs to re-authenticate
		// could be a 200 response with a message to the frontend
		return c.JSON(500, map[string]string{"error": err.Error()})
	}
	return c.JSON(200, map[string]string{"access_token": token})
}
