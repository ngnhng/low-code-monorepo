package controller

import (
	googleOauthLoginController "yalc/auth-service/api/controller/oauth"
)

type (
	Controller interface {
	}
)

var _ Controller = &googleOauthLoginController.GoogleOAuthLoginController{}
