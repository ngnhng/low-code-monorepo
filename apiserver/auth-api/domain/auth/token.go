package auth

import (
	"errors"
)

const (
	ProviderGoogle OAuthProvider = "google"
)

var (
	ErrInvalidTokenType = errors.New("invalid token type")
)

type (

	// OAuthToken is customer's 3rd party OAuth token
	// We only store the refresh token
	// The access token is short-lived and can be obtained using the refresh token
	OAuthToken struct {
		OwnerID  string        `json:"owner_id"`
		Provider OAuthProvider `json:"provider"`

		RefreshToken string `json:"refresh_token"`
	}

	OAuthProvider string

	ErrTokenNotFound struct {
		OwnerID  string
		Provider string
	}
)

func (t OAuthProvider) Validate() error {
	if t != ProviderGoogle {
		return ErrInvalidTokenType
	}
	return nil
}

func (e *ErrTokenNotFound) Error() string {
	return "token of type not found for owner " + e.OwnerID + " and provider " + e.Provider
}
