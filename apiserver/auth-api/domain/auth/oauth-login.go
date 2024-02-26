package auth

import (
	oauth_client "golang.org/x/oauth2"
	oauth2 "google.golang.org/api/oauth2/v2"
)

type (
	GoogleOAuthAuthOptions struct {
	}

	GoogleOAuthToken struct {
		*oauth_client.Token
	}

	GoogleOAuthUserInfo struct {
		*oauth2.Userinfo
	}

	OauthLoginRequest struct {
		Email string `form:"email" binding:"required,email"`
	}
	OauthLoginResponse struct {
		AccessToken  string `json:"accessToken"`
		RefreshToken string `json:"refreshToken"`
	}
)
