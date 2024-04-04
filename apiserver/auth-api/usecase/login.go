package usecase

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	auth "yalc/auth-service/domain/auth"
	"yalc/auth-service/module/config"
	"yalc/auth-service/module/logger"
	repository "yalc/auth-service/repository"

	user_connector "yalc/auth-service/connector/user"
	oauth2_module "yalc/auth-service/module/oauth2"

	oauth2 "golang.org/x/oauth2"
	v2 "google.golang.org/api/oauth2/v2"

	"go.uber.org/fx"
)

type (
	GoogleOAuthLoginUsecase struct {
		config          *config.Config
		Logger          logger.Logger
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
		Logger          logger.Logger
		TokenRepository repository.TokenRepository
		OAuthProvider   *oauth2_module.GoogleProvider
		user_connector.UserConnector
	}
)

func NewGoogleOAuthLoginUsecase(p Param) *GoogleOAuthLoginUsecase {
	return &GoogleOAuthLoginUsecase{
		contextTimeout:       time.Millisecond * time.Duration(1000),
		config:               p.Config,
		Logger:               p.Logger,
		tokenRepository:      p.TokenRepository,
		Provider:             p.OAuthProvider,
		UserServiceConnector: p.UserConnector,
	}
}

func (lu *GoogleOAuthLoginUsecase) GetProvider() *oauth2_module.GoogleProvider {
	return lu.Provider
}

// FetchUserInfoFromProvider fetches the user info from the oauth2 provider
// If opts is provided, it will refresh the token and save the new token
func (lu *GoogleOAuthLoginUsecase) FetchUserInfoFromProvider(ctx context.Context, token *oauth2.Token) (*auth.GoogleOAuthUserInfo, error) {
	// create a new http client with the refreshed google token
	lu.Client = lu.Provider.Config.Client(ctx, &oauth2.Token{
		AccessToken: token.AccessToken,
	})

	return lu.fetchGoogleUserInfo(ctx)
}

func (lu *GoogleOAuthLoginUsecase) GetRedirectURL(state string) string {
	return lu.Provider.AuthCodeURL(state)
}

func (lu *GoogleOAuthLoginUsecase) Exchange(ctx context.Context, code string) (*oauth2.Token, error) {
	return lu.Provider.Exchange(ctx, code)
}

func (lu *GoogleOAuthLoginUsecase) SaveUser(ctx context.Context, info *auth.GoogleOAuthUserInfo) (string, error) {
	return lu.UserServiceConnector.SaveUser(ctx, info)
}

func (lu *GoogleOAuthLoginUsecase) SaveToken(ctx context.Context, token *oauth2.Token, userInfo *auth.GoogleOAuthUserInfo) error {
	if token.RefreshToken != "" {
		if err := lu.UpdateToken(token, userInfo); err != nil {
			return err
		}
	} else {
		// if no refresh token, log the error and return
		lu.Logger.Error("no refresh token found")
	}
	return nil
}

func (lu *GoogleOAuthLoginUsecase) GetToken(ctx context.Context, userInfo *auth.GoogleOAuthUserInfo) (*oauth2.Token, error) {
	token, err := lu.tokenRepository.Get(context.Background(), auth.OAuthToken{
		OwnerID:  userInfo.Email,
		Provider: "google",
	})
	if err != nil {
		return nil, err
	}

	newToken, err := lu.Provider.NewAccessTokenFromRefreshToken(ctx, token.RefreshToken)
	if err != nil {
		return nil, err
	}

	return newToken, nil
}

func (lu *GoogleOAuthLoginUsecase) RefreshToken(ctx context.Context, token *oauth2.Token) (*oauth2.Token, error) {
	return lu.Provider.RefreshToken(ctx, token)
}

func (lu *GoogleOAuthLoginUsecase) UpdateToken(token *oauth2.Token, userInfo *auth.GoogleOAuthUserInfo) error {
	if userInfo == nil {
		return fmt.Errorf("userInfo is nil")
	}
	return lu.tokenRepository.Update(context.Background(), auth.OAuthToken{
		OwnerID:      userInfo.Email,
		Provider:     "google",
		RefreshToken: token.RefreshToken,
	})
}

func (lu *GoogleOAuthLoginUsecase) fetchGoogleUserInfo(ctx context.Context) (*auth.GoogleOAuthUserInfo, error) {
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
