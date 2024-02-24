package usecase

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	auth "yalc/auth-service/domain/auth"
	"yalc/auth-service/module/config"
	repository "yalc/auth-service/repository"

	user_connector "yalc/auth-service/connector/user"
	oauth2_module "yalc/auth-service/module/oauth2"

	oauth2 "golang.org/x/oauth2"
	v2 "google.golang.org/api/oauth2/v2"

	"go.uber.org/fx"
)

type (
	GoogleOAuthLoginUsecase interface {
		// Provider returns the oauth2 provider
		GetProvider() *oauth2_module.GoogleProvider

		// GetRedirectURL returns the URL to redirect the user to for authorization.
		GetRedirectURL(state string) string

		// FetchUserInfo returns the user info from the oauth2 provider
		FetchUserInfoFromProvider(ctx context.Context, token *oauth2.Token, opts ...*RefreshTokenOptions) (*auth.GoogleOAuthUserInfo, error)

		// SaveUser saves/updates a user in our system
		SaveUser(ctx context.Context, info *auth.GoogleOAuthUserInfo) (string, error)
		// SaveToken saves/updates a user's token in our system
		SaveToken(ctx context.Context, token *oauth2.Token, userInfo *auth.GoogleOAuthUserInfo) error
		// GetToken gets a user's token from our system
		GetToken(ctx context.Context, userInfo *auth.GoogleOAuthUserInfo) (*oauth2.Token, error)

		// RefreshToken refreshes the token
		RefreshToken(ctx context.Context, token *oauth2.Token) (*oauth2.Token, error)

		// Exchange converts an authorization code into a token.
		Exchange(ctx context.Context, code string) (*oauth2.Token, error)
	}

	googleOAuthLoginUsecase struct {
		config          *config.Config
		tokenRepository repository.TokenRepository
		contextTimeout  time.Duration

		Provider             *oauth2_module.GoogleProvider
		UserServiceConnector user_connector.UserConnector
		Client               *http.Client
	}

	RefreshTokenOptions struct {
		*auth.GoogleOAuthUserInfo
	}

	Param struct {
		fx.In

		Config          *config.Config
		TokenRepository repository.TokenRepository
		OAuthProvider   *oauth2_module.GoogleProvider
		user_connector.UserConnector
	}
)

func NewGoogleOAuthLoginUsecase(p Param) GoogleOAuthLoginUsecase {
	return &googleOAuthLoginUsecase{
		contextTimeout:       time.Millisecond * time.Duration(1000),
		config:               p.Config,
		tokenRepository:      p.TokenRepository,
		Provider:             p.OAuthProvider,
		UserServiceConnector: p.UserConnector,
	}
}

func (lu *googleOAuthLoginUsecase) GetProvider() *oauth2_module.GoogleProvider {
	return lu.Provider
}

// FetchUserInfoFromProvider fetches the user info from the oauth2 provider
// If opts is provided, it will refresh the token and save the new token
func (lu *googleOAuthLoginUsecase) FetchUserInfoFromProvider(ctx context.Context, token *oauth2.Token, opts ...*RefreshTokenOptions) (*auth.GoogleOAuthUserInfo, error) {
	// First refresh the token if opts is provided
	if len(opts) > 0 {
		token, err := lu.RefreshToken(ctx, token)
		if err != nil {
			return nil, err
		}
		// save the token
		err = lu.SaveToken(ctx, token, opts[0].GoogleOAuthUserInfo)
		if err != nil {
			return nil, err
		}
	}

	// create a new http client with the refreshed google token
	lu.Client = lu.Provider.Config.Client(ctx, &oauth2.Token{
		AccessToken: token.AccessToken,
	})

	return lu.fetchGoogleUserInfo(ctx)
}

func (lu *googleOAuthLoginUsecase) GetRedirectURL(state string) string {
	return lu.Provider.AuthCodeURL(state)
}

func (lu *googleOAuthLoginUsecase) Exchange(ctx context.Context, code string) (*oauth2.Token, error) {
	return lu.Provider.Exchange(ctx, code)
}

func (lu *googleOAuthLoginUsecase) SaveUser(ctx context.Context, info *auth.GoogleOAuthUserInfo) (string, error) {
	return lu.UserServiceConnector.SaveUser(ctx, info)
}

func (lu *googleOAuthLoginUsecase) SaveToken(ctx context.Context, token *oauth2.Token, userInfo *auth.GoogleOAuthUserInfo) error {
	if token.AccessToken != "" {
		if err := lu.UpdateAccessToken(token, userInfo); err != nil {
			return err
		}
	}
	if token.RefreshToken != "" {
		if err := lu.UpdateRefreshToken(token, userInfo); err != nil {
			return err
		}
	}
	return nil
}

func (lu *googleOAuthLoginUsecase) GetToken(ctx context.Context, userInfo *auth.GoogleOAuthUserInfo) (*oauth2.Token, error) {
	accessToken, err := lu.tokenRepository.Get(context.Background(), auth.OAuthToken{
		OwnerID:  userInfo.Email,
		Provider: "google",
		Type:     auth.AccessToken,
	})

	if err != nil {
		return nil, err
	}

	refreshToken, err := lu.tokenRepository.Get(context.Background(), auth.OAuthToken{
		OwnerID:  userInfo.Email,
		Provider: "google",
		Type:     auth.RefreshToken,
	})

	if err != nil {
		return nil, err
	}

	return &oauth2.Token{
		AccessToken:  accessToken.Value,
		RefreshToken: refreshToken.Value,
	}, nil
}

func (lu *googleOAuthLoginUsecase) RefreshToken(ctx context.Context, token *oauth2.Token) (*oauth2.Token, error) {
	return lu.Provider.RefreshToken(ctx, token)
}

func (lu *googleOAuthLoginUsecase) UpdateAccessToken(token *oauth2.Token, userInfo *auth.GoogleOAuthUserInfo) error {
	if userInfo == nil {
		return fmt.Errorf("userInfo is nil")
	}
	return lu.tokenRepository.Update(context.Background(), auth.OAuthToken{
		OwnerID:  userInfo.Email,
		Provider: "google",
		Type:     auth.AccessToken,
		Value:    token.AccessToken,
	})
}

func (lu *googleOAuthLoginUsecase) UpdateRefreshToken(token *oauth2.Token, userInfo *auth.GoogleOAuthUserInfo) error {
	return lu.tokenRepository.Update(context.Background(), auth.OAuthToken{
		OwnerID:  userInfo.Email,
		Provider: "google",
		Type:     auth.RefreshToken,
		Value:    token.RefreshToken,
	})
}

func (lu *googleOAuthLoginUsecase) fetchGoogleUserInfo(ctx context.Context) (*auth.GoogleOAuthUserInfo, error) {
	resp, err := lu.Client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch user info: status code %d", resp.StatusCode)
	}

	var userInfo *v2.Userinfo
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return nil, err
	}

	return &auth.GoogleOAuthUserInfo{
		Userinfo: userInfo,
	}, nil
}
