package oauth2

import (
	"context"
	"net/http"

	"golang.org/x/oauth2"
)

// Provider represents an OAuth2 provider.
type Provider interface {
	// AuthCodeURL returns the URL to redirect the user to for authorization.
	AuthCodeURL(state string) string

	// Exchange converts an authorization code into a token.
	Exchange(ctx context.Context, code string) (*oauth2.Token, error)

	// Client returns an HTTP client that adds the OAuth2 token to requests.
	Client(ctx context.Context, token *oauth2.Token) *http.Client
}
