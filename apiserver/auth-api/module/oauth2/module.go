package oauth2

import (
	"errors"
	"yalc/auth-service/module/config"

	"go.uber.org/fx"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type (
	Params struct {
		fx.In

		*config.Config
	}

	Result struct {
		fx.Out

		*GoogleProvider
	}
)

func GetModule() fx.Option {
	var opts []fx.Option

	opts = append(opts, fx.Provide(NewGoogleProvider))

	return fx.Options(opts...)
}

// NewGoogleProvider creates a new GoogleProvider with the specified client ID and secret.
func NewGoogleProvider(p Params) (Result, error) {
	if p.Config.OAuth.Google.ClientID == "" ||
		p.Config.OAuth.Google.ClientSecret == "" ||
		p.Config.OAuth.Google.RedirectURL == "" {
		return Result{}, errors.New("missing google oauth2 provider configuration")
	}

	clientID := p.Config.OAuth.Google.ClientID
	clientSecret := p.Config.OAuth.Google.ClientSecret
	redirectURL := p.Config.OAuth.Google.RedirectURL

	config := &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RedirectURL:  redirectURL,
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
			// sheet
			"https://www.googleapis.com/auth/spreadsheets",
		},
		Endpoint: google.Endpoint,
	}

	return Result{
		GoogleProvider: &GoogleProvider{
			Config: config,
		},
	}, nil
}
