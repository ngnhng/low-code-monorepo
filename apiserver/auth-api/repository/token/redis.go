package token

import (
	"context"
	"encoding/json"
	"strings"

	auth "yalc/auth-service/domain/auth"
	"yalc/auth-service/module/logger"

	db "yalc/auth-service/module/database/redis"

	"go.uber.org/fx"
	"golang.org/x/oauth2"
)

type (
	RedisTokenRepository struct {
		Client *db.RedisClient
		Logger logger.Logger
	}

	Params struct {
		fx.In

		Client *db.RedisClient
		Logger logger.Logger
	}
)

func NewRedisTokenRepository(p Params) *RedisTokenRepository {
	return &RedisTokenRepository{
		Client: p.Client,
		Logger: p.Logger,
	}
}

func (r *RedisTokenRepository) Create(ctx context.Context, token auth.OAuthToken) error {
	json, err := json.Marshal(token)
	if err != nil {
		return err
	}
	r.Client.Set(ctx, createRedisKey(token), json, 0)
	return nil
}

func (r *RedisTokenRepository) Update(ctx context.Context, token auth.OAuthToken) error {
	json, err := json.Marshal(token)
	if err != nil {
		return err
	}
	r.Client.Set(ctx, createRedisKey(token), json, 0)
	return nil
}

func (r *RedisTokenRepository) Get(ctx context.Context, token auth.OAuthToken) (auth.OAuthToken, error) {
	key := createRedisKey(token)
	r.Logger.Debug("getting token from redis: ", key)
	value, err := r.Client.Get(ctx, key).Result()
	if err != nil {
		r.Logger.Error("error getting token from redis: ", err)
		return auth.OAuthToken{}, err
	}

	var resultToken auth.OAuthToken
	err = json.Unmarshal([]byte(value), &resultToken)
	if err != nil {
		r.Logger.Error("error unmarshalling token from redis: ", err)
		return auth.OAuthToken{}, err
	}

	return resultToken, nil
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
		tokenOwnerID, tokenProvider := extractRedisKey(key)

		convertedProvider := auth.OAuthProvider(tokenProvider)
		err = convertedProvider.Validate()
		if err != nil {
			return nil, err
		}

		var resultToken *oauth2.Token
		err = json.Unmarshal([]byte(token), &resultToken)
		if err != nil {
			return nil, err
		}

		tokens = append(tokens, auth.OAuthToken{
			OwnerID:      tokenOwnerID,
			Provider:     convertedProvider,
			RefreshToken: resultToken.RefreshToken,
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
	return token.OwnerID + ":" + string(token.Provider)
}

func extractRedisKey(key string) (string, string) {
	keys := strings.Split(key, ":")
	return keys[0], keys[1]
}
