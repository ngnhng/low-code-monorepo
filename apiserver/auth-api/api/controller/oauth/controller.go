package oauth_login

import (
	"time"
	"yalc/auth-service/module/config"
	"yalc/auth-service/module/logger"
	"yalc/auth-service/shared/util"
	"yalc/auth-service/usecase"

	"github.com/labstack/echo/v4"

	response "yalc/auth-service/domain/response"
	error_response "yalc/auth-service/domain/response/error"
	"yalc/auth-service/domain/user"

	oauth2_module "yalc/auth-service/module/oauth2"
)

type (
	GoogleOAuthLoginController struct {
		Usecase *usecase.GoogleOAuthLoginUsecase
		Config  *config.Config
		Logger  logger.Logger

		Provider *oauth2_module.GoogleProvider
	}
)

func NewGoogleOAuthLoginController(
	uc *usecase.GoogleOAuthLoginUsecase,
	config *config.Config,
	logger logger.Logger,
	provider *oauth2_module.GoogleProvider,
) *GoogleOAuthLoginController {
	return &GoogleOAuthLoginController{
		Usecase:  uc,
		Config:   config,
		Logger:   logger,
		Provider: provider,
	}
}

// Login redirects to google oauth2 login page to ask for user's permission
func (ctrl *GoogleOAuthLoginController) Login(c echo.Context) error {
	state := c.FormValue("state")
	// redirect to google oauth2 login page
	url := ctrl.Usecase.GetRedirectURL(state)
	ctrl.Logger.Debugf("redirecting to %s", url)
	return c.Redirect(302, url)
}

// Callback handles the callback from google oauth2 login page after user has granted permission and google redirects back to our site
// We will exchange the code for token and store the token
// Response will be a redirect to the frontend with the token as query param
func (ctrl *GoogleOAuthLoginController) Callback(c echo.Context) error {
	// get code from param
	code := c.QueryParam("code")
	if code == "" {
		return c.String(400, "No code provided")
		//return error_response.BadRequestError(c, "error", "no code provided")
	}

	// exchange code for token
	token, err := ctrl.Provider.Exchange(c.Request().Context(), code)

	if err != nil || token == nil {
		return c.String(500, "Faied to exchange code for token: "+err.Error())
		//return error_response.InternalServerError(c, "error", "failed to exchange code for token: "+err.Error())
	}

	if token.RefreshToken == "" {
		return c.String(500, "No refresh token provided")
	}

	// fetch user info
	userInfo, err := ctrl.Usecase.FetchUserInfoFromProvider(c.Request().Context(), token)
	if err != nil || userInfo == nil {
		return c.String(500, "Failed to fetch user info: "+err.Error())
		//return error_response.InternalServerError(c, "error", "failed to fetch user info: "+err.Error())
	}

	// upsert user info with our database
	upsertedUserId, err := ctrl.Usecase.SaveUser(c.Request().Context(), userInfo)

	if err != nil {
		return c.String(500, "Failed to save user: "+err.Error())
		//return error_response.InternalServerError(c, "error", "failed to save user: "+err.Error())
	}

	// store state -- this may overwrite the state if it already exists
	err = ctrl.Usecase.SaveToken(c.Request().Context(), token, userInfo)
	if err != nil {
		return error_response.InternalServerError(c, "error", "failed to save token: "+err.Error())
	}

	// generate an access token with expiration time equal to the oauth provider access token expiration time
	at, err := util.CreateAccessToken(
		&user.User{
			Id:           upsertedUserId,
			Email:        userInfo.Email,
			FirstName:    userInfo.GivenName,
			LastName:     userInfo.FamilyName,
			ProfileImage: userInfo.Picture,
		},
		ctrl.Config.Jwt.Access.Key,
		time.Now().Add(ctrl.Config.Jwt.Access.Expiration),
	)
	if err != nil {
		return error_response.InternalServerError(c, "error", "failed to generate access token: "+err.Error())
	}

	//rt, err := util.CreateRefreshToken(&user.User{
	//	Email: userInfo.Email,
	//	Name:  "test",
	//}, ctrl.Config.Secret.JwtSecret.Refresh.Key, ctrl.Config.Secret.JwtSecret.Refresh.Expiration)
	//if err != nil {
	//	return error_response.InternalServerError(c, "error", "failed to generate refresh token: "+err.Error())
	//}

	// redirect to frontend with token as query param
	return c.Redirect(302, ctrl.Config.App.FrontendURL+"/auth/login"+"?access_token="+at)
}

// ValidateToken validates the token
// TODO: use middleware to process and store user to context
// here we validate the token claims and other stuff (expired, revoked, etc)
func (ctrl *GoogleOAuthLoginController) ValidateToken(c echo.Context) error {
	token, err := util.ExtractToken(c.Request().Header.Get("Authorization"))
	if err != nil {
		return error_response.BadRequestError(c, "error", err.Error())
	}

	_, err = util.ValidateToken(token, ctrl.Config.Jwt.Access.Key)
	if err != nil {
		return error_response.UnauthorizedError(c, err.Error(), "invalid token")
	}

	return c.JSON(
		200, response.NewResponse(
			response.ResponseMeta{
				StatusCode: 200,
				Message:    "valid token",
				Error:      "",
			},
			map[string]interface{}{},
		),
	)
}
