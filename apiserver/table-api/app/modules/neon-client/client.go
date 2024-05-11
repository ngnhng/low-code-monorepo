package neonclient

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
	"yalc/dbms/modules/config"
	"yalc/dbms/modules/logger"

	"go.uber.org/fx"
)

type (
	NeonClient struct {
		*http.Client
		Logger logger.Logger

		// BaseURl is the base URL for the Neon API
		BaseURL string
		// apiKey is the API key for the Neon API
		apiKey string
		// owner is the owner name for the database
		Owner string
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
		Logger logger.Logger
	}
)

func NewClient(p Params) *NeonClient {
	return &NeonClient{
		Client:    http.DefaultClient,
		Logger:    p.Logger,
		BaseURL:   p.Config.Neon.BaseURL,
		Owner:     p.Config.Neon.Owner,
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

func (c *NeonClient) post(url string, body io.Reader) (*http.Response, error) {
	// create a new request
	req, err := http.NewRequest("POST", c.BaseURL+url, body)
	if err != nil {
		return nil, err
	}

	// add the API key to the request
	req.Header.Add("authorization", fmt.Sprintf("Bearer %s", c.apiKey))

	// set the content type
	// accept is to tell the server what kind of response we want
	req.Header.Add("Accept", "application/json")
	// content type is to tell the server what kind of data we are sending
	req.Header.Add("Content-Type", "application/json")

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

	// create the JSON body
	// TODO: move to domain and add validation
	bodyMap := map[string]map[string]string{
		"database": {
			"name":       name,
			"owner_name": c.Owner,
		},
	}
	bodyBytes, err := json.Marshal(bodyMap)
	if err != nil {
		return err
	}
	body := bytes.NewBuffer(bodyBytes)

	// create a new request
	resp, err := c.post(fmt.Sprintf("/projects/%s/branches/%s/databases", c.projectId, c.branchId), body)
	if err != nil {
		c.Logger.Error("failed to create database: ", err)
		return err
	}
	if resp.StatusCode != http.StatusCreated {
		c.Logger.Error("failed to create database: ", resp.Status)
		return fmt.Errorf("failed to create database: %s", resp.Status)
	}

	return nil
}

func (c *NeonClient) GetDatabaseDetails(name string) (*http.Response, error) {
	//GET projects/{project_id}/branches/{branch_id}/databases/{database_name}	// create a new request
	return c.get(fmt.Sprintf("/projects/%s/branches/%s/databases/%s", c.projectId, c.branchId, name))
}

func (c *NeonClient) WaitForDatabase(name string) error {
	// retry 10 times with 5 seconds interval
	return withRetry(10, 5*time.Second, func() error {
		resp, err := c.GetDatabaseDetails(name)
		if err != nil {
			c.Logger.Error("failed to check for database: ", err)
			return err
		}
		if resp.StatusCode == http.StatusOK {
			return nil
		}

		c.Logger.Error("failed to wait for database: ", resp.Status)
		return fmt.Errorf("failed to wait for database: %s", resp.Status)
	})
}

func withRetry(
	times int,
	interval time.Duration,
	fn func() error,
) error {
	var err error
	for i := 0; i < times; i++ {
		err = fn()
		if err == nil {
			return nil
		}
		time.Sleep(interval)
	}
	return err
}
