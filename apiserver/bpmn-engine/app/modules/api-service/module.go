package apiservice

import (
	"bytes"
	"net/http"
)

type (
	ApiService struct {
		*http.Client
		*ApiServiceConfig
	}

	ApiServiceConfig struct {
		BaseUrl     string
		BearerToken string
	}
)

// NewApiService returns a new ApiService with attached bearer token
func NewApiService(config ApiServiceConfig) *ApiService {
	return &ApiService{
		Client:           &http.Client{},
		ApiServiceConfig: &config,
	}
}

// SetBearerToken sets the bearer token for the ApiService
func (a *ApiService) SetBearerToken(token string) {
	a.BearerToken = token
}

// Get performs a GET request to the ApiService
func (a *ApiService) Get(url string) (*http.Response, error) {
	req, err := http.NewRequest("GET", a.BaseUrl+url, nil)
	if err != nil {
		return nil, err
	}
	if a.BearerToken != "" {
		req.Header.Set("Authorization", "Bearer "+a.BearerToken)
	}
	return a.Do(req)
}

// Post performs a POST request to the ApiService
func (a *ApiService) Post(url string, body []byte) (*http.Response, error) {
	req, err := http.NewRequest("POST", a.BaseUrl+url, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	if a.BearerToken != "" {
		req.Header.Set("Authorization", "Bearer "+a.BearerToken)
	}
	req.Header.Set("Content-Type", "application/json")
	return a.Do(req)
}
