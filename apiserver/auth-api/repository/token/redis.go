package token

import (
	"context"
	"strings"

	auth "yalc/auth-service/domain/auth"

	redis_db "github.com/redis/go-redis/v9"
)

type (
	RedisTokenRepository struct {
		Client *redis_db.Client
	}
)

func NewRedisTokenRepository(client *redis_db.Client) *RedisTokenRepository {
	return &RedisTokenRepository{
		Client: client,
	}
}

func (r *RedisTokenRepository) Create(ctx context.Context, token auth.OAuthToken) error {
	r.Client.Set(ctx, createRedisKey(token), token.Value, 0)
	return nil
}

func (r *RedisTokenRepository) Update(ctx context.Context, token auth.OAuthToken) error {
	r.Client.Set(ctx, createRedisKey(token), token.Value, 0)
	return nil
}

func (r *RedisTokenRepository) Get(ctx context.Context, token auth.OAuthToken) (auth.OAuthToken, error) {
	key := createRedisKey(token)
	value, err := r.Client.Get(ctx, key).Result()
	if err != nil {
		return auth.OAuthToken{}, err
	}

	return auth.OAuthToken{
		OwnerID:  token.OwnerID,
		Provider: token.Provider,
		Type:     token.Type,
		Value:    value,
	}, nil
}

func (r *RedisTokenRepository) GetAllFromOwner(ctx context.Context, ownerId string) ([]auth.OAuthToken, error) {
	keyPattern := ownerId + ":*"
	keys, err := r.Client.Keys(ctx, keyPattern).Result()
	if err != nil {
		return nil, err
	}

	tokens := make([]auth.OAuthToken, 0)
	for _, key := range keys {
		token, err := r.Client.Get(ctx, key).Result()
		if err != nil {
			return nil, err
		}
		tokenOwnerID, tokenProvider, tokenType := extractRedisKey(key)

		convertedTokenType := auth.TokenType(tokenType)
		err = convertedTokenType.Validate()
		if err != nil {
			return nil, err
		}

		convertedProvider := auth.OAuthProvider(tokenProvider)
		err = convertedProvider.Validate()
		if err != nil {
			return nil, err
		}

		tokens = append(tokens, auth.OAuthToken{
			OwnerID:  tokenOwnerID,
			Provider: convertedProvider,
			Type:     convertedTokenType,
			Value:    token,
		})
	}

	return tokens, nil
}

func (r *RedisTokenRepository) DeleteFromProvider(ctx context.Context, ownerId string, provider string) error {
	keyPattern := ownerId + ":" + provider + ":*"
	keys, err := r.Client.Keys(ctx, keyPattern).Result()
	if err != nil {
		return err
	}

	for _, key := range keys {
		r.Client.Del(ctx, key)
	}

	return nil
}

func createRedisKey(token auth.OAuthToken) string {
	return token.OwnerID + ":" + string(token.Provider) + ":" + string(token.Type)
}

func extractRedisKey(key string) (string, string, string) {
	keys := strings.Split(key, ":")
	return keys[0], keys[1], keys[2]
}
