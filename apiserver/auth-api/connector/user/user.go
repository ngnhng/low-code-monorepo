package user

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"time"
	"yalc/auth-service/domain/auth"
	user "yalc/auth-service/domain/user"
	"yalc/auth-service/module/config"
	"yalc/auth-service/shared/util"

	"go.uber.org/fx"
)

type (
	UserConnector interface {
		Ping() error

		// GetUser gets the user info from the store
		GetUser(ctx context.Context, ownerId string) (*user.User, error)

		// SaveUser saves/updates a user in our system
		SaveUser(ctx context.Context, info *auth.GoogleOAuthUserInfo) (string, error)
	}

	userConnector struct {
		baseUrl string
		client  *http.Client
		Config  *config.Config
	}

	Params struct {
		fx.In

		*config.Config
	}
)

type (
	// We only include the fields we need
	SaveUserResponseBody struct {
		Id string `json:"uuid"`
	}
)

func NewUserConnector(p Params) UserConnector {
	return &userConnector{
		baseUrl: p.Config.Api.UserApiUrl,
		client:  &http.Client{},
		Config:  p.Config,
	}
}

func (c *userConnector) Ping() error {
	return nil
}

func (c *userConnector) GetUser(ctx context.Context, ownerId string) (*user.User, error) {
	return nil, nil
}

func (c *userConnector) SaveUser(ctx context.Context, info *auth.GoogleOAuthUserInfo) (string, error) {
	body := map[string]interface{}{
		"email":      info.Email,
		"first_name": info.GivenName,
		"last_name":  info.FamilyName,
	}

	// Convert body to JSON
	jsonBody, err := json.Marshal(body)
	if err != nil {
		return "", err
	}

	// Convert JSON to bytes.Buffer
	buffer := bytes.NewBuffer(jsonBody)

	// Create a new request
	req, err := http.NewRequest("POST", c.baseUrl+"/api/users/upsert", buffer)
	if err != nil {
		return "", err
	}

	// Add the access token to the Authorization header
	at, err := util.CreateAccessToken(&user.User{
		Email: info.Email,
	}, c.Config.Jwt.Access.Key,
		time.Now().Add(c.Config.Jwt.Access.Expiration))
	if err != nil {
		return "", err
	}

	req.Header.Add("Authorization", "Bearer "+at)
	req.Header.Add("Content-Type", "application/json")

	// Send the request
	response, err := c.client.Do(req)
	if err != nil {
		return "", err
	}

	// Handle the response
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return "", err
	}

	bodyBytes, err := io.ReadAll(response.Body)
	if err != nil {
		return "", err
	}

	var responseBody SaveUserResponseBody
	err = json.Unmarshal(bodyBytes, &responseBody)
	if err != nil {
		return "", err
	}

	return responseBody.Id, nil
}
