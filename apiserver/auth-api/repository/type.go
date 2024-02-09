package repository

import (
	"context"
	"yalc/auth-service/domain/auth"
)

type (
	TokenRepository interface {
		Create(ctx context.Context, token auth.OAuthToken) error
		Update(ctx context.Context, token auth.OAuthToken) error
		GetAllFromOwner(ctx context.Context, ownerId string) ([]auth.OAuthToken, error)
		DeleteFromProvider(ctx context.Context, ownerId string, provider string) error
	}
)
