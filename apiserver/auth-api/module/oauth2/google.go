package oauth2

import (
	"context"
	"net/http"

	"golang.org/x/oauth2"
)

// GoogleProvider represents the Google OAuth2 provider.
type GoogleProvider struct {
	Config *oauth2.Config
}

// AuthCodeURL returns the URL to redirect the user to for authorization.
// We use the offline and force options to get a refresh token.
// See https://developers.google.com/identity/protocols/oauth2/web-server#offline.
func (p *GoogleProvider) AuthCodeURL(state string) string {
	return p.Config.AuthCodeURL(state, oauth2.AccessTypeOffline)
}

// Exchange converts an authorization code into a token.
func (p *GoogleProvider) Exchange(ctx context.Context, code string) (*oauth2.Token, error) {
	return p.Config.Exchange(ctx, code)
}

// Client returns an HTTP client that adds the OAuth2 token to requests.
func (p *GoogleProvider) Client(ctx context.Context, token *oauth2.Token) *http.Client {
	return p.Config.Client(ctx, token)
}

// RefreshToken refreshes the token.
func (p *GoogleProvider) RefreshToken(ctx context.Context, token *oauth2.Token) (*oauth2.Token, error) {
	return p.Config.TokenSource(ctx, token).Token()
}

// NewClientFromRefreshToken returns a new token source from a refresh token.
func (p *GoogleProvider) NewClientFromRefreshToken(ctx context.Context, refreshToken string) (*http.Client, error) {
	token := &oauth2.Token{
		RefreshToken: refreshToken,
	}

	return p.Config.Client(ctx, token), nil
}

// NewAccessTokenFromRefreshToken returns a new access token from a refresh token.
func (p *GoogleProvider) NewAccessTokenFromRefreshToken(ctx context.Context, refreshToken string) (*oauth2.Token, error) {
	token := &oauth2.Token{
		RefreshToken: refreshToken,
	}

	return p.Config.TokenSource(ctx, token).Token()
}
