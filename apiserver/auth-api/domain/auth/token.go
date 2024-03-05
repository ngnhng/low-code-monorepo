package auth

import "errors"

const (
	AccessToken  TokenType = "access_token"
	RefreshToken TokenType = "refresh_token"

	ProviderGoogle OAuthProvider = "google"
)

var (
	ErrInvalidTokenType = errors.New("invalid token type")
)

type (
	OAuthToken struct {
		OwnerID  string        `json:"owner_id"`
		Provider OAuthProvider `json:"provider"`
		Type     TokenType     `json:"type"`

		Value string `json:"value"`
	}

	OAuthProvider string
	TokenType     string

	ErrTokenNotFound struct {
		OwnerID  string
		Provider string
	}
)

func (t TokenType) Validate() error {
	if t != AccessToken && t != RefreshToken {
		return ErrInvalidTokenType
	}
	return nil
}

func (t OAuthProvider) Validate() error {
	if t != ProviderGoogle {
		return ErrInvalidTokenType
	}
	return nil
}

func (e *ErrTokenNotFound) Error() string {
	return "token of type not found for owner " + e.OwnerID + " and provider " + e.Provider
}
