package usecase

import (
	"context"
	"yalc/auth-service/domain/auth"
	"yalc/auth-service/module/config"
	"yalc/auth-service/module/logger"
	oauth_module "yalc/auth-service/module/oauth2"
	"yalc/auth-service/repository"

	"go.uber.org/fx"
)

type (
	GetGoogleOAuthTokenUsecase struct {
		*config.Config
		logger.Logger
		*oauth_module.GoogleProvider
		repository.TokenRepository
	}

	GetGoogleOAuthTokenUsecaseParams struct {
		fx.In

		Config     *config.Config
		Logger     logger.Logger
		Provider   *oauth_module.GoogleProvider
		Repository repository.TokenRepository
	}
)

func NewGetGoogleOAuthTokenUsecase(p GetGoogleOAuthTokenUsecaseParams) *GetGoogleOAuthTokenUsecase {
	return &GetGoogleOAuthTokenUsecase{
		Config:          p.Config,
		Logger:          p.Logger,
		GoogleProvider:  p.Provider,
		TokenRepository: p.Repository,
	}
}

// GetAccessToken returns the access token from the token store
// Check if the token is still valid
// If not, refresh the token and return the new token
// Save the new token in the token store
func (u *GetGoogleOAuthTokenUsecase) GetAccessToken(ctx context.Context, ownerId string) (string, error) {
	oauthToken := auth.OAuthToken{
		OwnerID:  ownerId,
		Provider: auth.ProviderGoogle,
	}

	token, err := u.TokenRepository.Get(ctx, oauthToken)
	if err != nil {
		u.Logger.Error("error getting token from repository: ", err)
		return "", err
	}

	// check if the token is still valid
	if token.RefreshToken == "" {
		u.Logger.Error("refresh token not found", "owner_id", ownerId, "provider", string(auth.ProviderGoogle))
		return "", &auth.ErrTokenNotFound{OwnerID: ownerId, Provider: string(auth.ProviderGoogle)}
	}

	// get new access token
	newToken, err := u.GoogleProvider.NewAccessTokenFromRefreshToken(ctx, token.RefreshToken)
	if err != nil {
		// the refresh token is invalid
		u.Logger.Error("error getting new access token: ", err)
		return "", err
	}

	u.Debug("new access token", "access_token", newToken.AccessToken)

	return newToken.AccessToken, nil
}
