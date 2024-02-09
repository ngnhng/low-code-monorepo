package oauth_login

import (
	"yalc/auth-service/module/config"
	"yalc/auth-service/module/logger"
	"yalc/auth-service/shared/util"
	"yalc/auth-service/usecase"

	"github.com/labstack/echo/v4"

	error_response "yalc/auth-service/domain/response/error"
	"yalc/auth-service/domain/user"

	oauth2_module "yalc/auth-service/module/oauth2"
)

type (
	GoogleOAuthLoginController struct {
		Usecase usecase.GoogleOAuthLoginUsecase
		Config  *config.Config
		Logger  logger.Logger

		Provider *oauth2_module.GoogleProvider
	}
)

func NewGoogleOAuthLoginController(
	uc usecase.GoogleOAuthLoginUsecase,
	config *config.Config,
	logger logger.Logger,
) *GoogleOAuthLoginController {
	return &GoogleOAuthLoginController{
		Usecase:  uc,
		Config:   config,
		Logger:   logger,
		Provider: uc.GetProvider(),
	}
}

// Login redirects to google oauth2 login page to ask for user's permission
func (ctrl *GoogleOAuthLoginController) Login(c echo.Context) error {
	state := c.FormValue("state")
	// redirect to google oauth2 login page
	url := ctrl.Usecase.GetRedirectURL(state)
	return c.Redirect(302, url)
}

// Callback handles the callback from google oauth2 login page after user has granted permission and google redirects back to our site
// We will exchange the code for token and store the token
// Response will be a redirect to the frontend with the token as query param
func (ctrl *GoogleOAuthLoginController) Callback(c echo.Context) error {
	// get code from param
	code := c.QueryParam("code")
	if code == "" {
		//return c.String(400, "No code provided")
		return error_response.BadRequestError(c, "error", "no code provided")
	}

	// exchange code for token
	token, err := ctrl.Provider.Exchange(c.Request().Context(), code)

	if err != nil {
		//return c.String(500, "Failed to exchange code for token: "+err.Error())
		return error_response.InternalServerError(c, "error", "failed to exchange code for token: "+err.Error())
	}

	// fetch user info
	userInfo, err := ctrl.Usecase.FetchUserInfoFromProvider(c.Request().Context(), token.AccessToken)
	if err != nil {
		//return c.String(500, "Failed to fetch user info: "+err.Error())
		return error_response.InternalServerError(c, "error", "failed to fetch user info: "+err.Error())
	}

	// store state -- this may overwrite the state if it already exists
	err = ctrl.Usecase.UpdateAccessToken(token, userInfo)
	if err != nil {
		return error_response.InternalServerError(c, "error", "failed to save state: "+err.Error())
	}

	// generate a pair of jwt tokens
	at, err := util.CreateAccessToken(&user.User{
		ID:    "0",
		Email: userInfo.Email,
		Name:  "test",
	}, ctrl.Config.Secret.JwtSecret.Access.Key, ctrl.Config.Secret.JwtSecret.Access.Expiration)
	if err != nil {
		return error_response.InternalServerError(c, "error", "failed to generate access token: "+err.Error())
	}

	rt, err := util.CreateRefreshToken(&user.User{
		ID:    "0",
		Email: userInfo.Email,
		Name:  "test",
	}, ctrl.Config.Secret.JwtSecret.Refresh.Key, ctrl.Config.Secret.JwtSecret.Refresh.Expiration)
	if err != nil {
		return error_response.InternalServerError(c, "error", "failed to generate refresh token: "+err.Error())
	}

	// redirect to frontend with token as query param
	return c.Redirect(302, ctrl.Config.App.FrontendURL+"?access_token="+at+"&refresh_token="+rt)
}

// ValidateToken validates the token
func (ctrl *GoogleOAuthLoginController) ValidateToken(c echo.Context) error {
	token := c.FormValue("token")
	if token == "" {
		return error_response.BadRequestError(c, "error", "no token provided")
	}

	// validate token
	_, err := util.ValidateToken(token, ctrl.Config.Secret.JwtSecret.Access.Key)
	if err != nil {
		return error_response.UnauthorizedError(c, "error", "invalid token")
	}

	return c.JSON(200, map[string]interface{}{
		"message": "valid token",
	})
}
