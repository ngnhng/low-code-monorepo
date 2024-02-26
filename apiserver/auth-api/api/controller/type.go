package controller

import (
	googleOauthLoginController "yalc/auth-service/api/controller/oauth-login"
)

type (
	Controller interface {
	}
)

var _ Controller = &googleOauthLoginController.GoogleOAuthLoginController{}
