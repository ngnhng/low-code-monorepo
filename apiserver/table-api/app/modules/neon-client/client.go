package neonclient

import (
	"fmt"
	"net/http"
	"yalc/dbms/modules/config"

	"go.uber.org/fx"
)

type (
	NeonClient struct {
		*http.Client

		// BaseURl is the base URL for the Neon API
		BaseURL string
		// apiKey is the API key for the Neon API
		apiKey string
		// projectId is the project ID for the Neon API
		projectId string
		// branchId is the branch ID for the Neon API
		branchId string
		// api service -- for better abstraction, we can create a service layer for http requests
		// service *api.Service
	}

	Params struct {
		fx.In

		Config *config.Config
	}
)

func NewClient(p Params) *NeonClient {
	return &NeonClient{
		Client:    http.DefaultClient,
		BaseURL:   p.Config.Neon.BaseURL,
		apiKey:    p.Config.Neon.APIKey,
		projectId: p.Config.Neon.ProjectId,
		branchId:  p.Config.Neon.BranchId,
	}
}

func (c *NeonClient) get(url string) (*http.Response, error) {
	// create a new request
	req, err := http.NewRequest("GET", c.BaseURL+url, nil)
	if err != nil {
		return nil, err
	}
	// add the API key to the request
	req.Header.Add("authorization", fmt.Sprintf("Bearer %s", c.apiKey))

	// send the request
	return c.Do(req)
}

func (c *NeonClient) post(url string) (*http.Response, error) {
	// create a new request
	req, err := http.NewRequest("POST", c.BaseURL+url, nil)
	if err != nil {
		return nil, err
	}
	// add the API key to the request
	req.Header.Add("authorization", fmt.Sprintf("Bearer %s", c.apiKey))

	// send the request
	return c.Do(req)
}

func (c *NeonClient) GetListOfDatabases() (*http.Response, error) {
	// GET projects/{project_id}/branches/{branch_id}/databases
	// create a new request
	return c.get(fmt.Sprintf("/projects/%s/branches/%s/databases", c.projectId, c.branchId))
}

func (c *NeonClient) CreateDatabase(name string) error {
	// POST /projects/{project_id}/branches/{branch_id}/databases
	// create a new request
	resp, err := c.post(fmt.Sprintf("/projects/%s/branches/%s/databases?name=%s", c.projectId, c.branchId, name))
	if err != nil {
		return err
	}
	if resp.StatusCode != http.StatusCreated {
		return fmt.Errorf("failed to create database: %s", resp.Status)
	}

	return nil
}
