package usecase

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"
	"yalc/bpmn-engine/domain"
	apiservice "yalc/bpmn-engine/modules/api-service"
	"yalc/bpmn-engine/modules/config"
	googlesheet "yalc/bpmn-engine/modules/google-sheet"
	"yalc/bpmn-engine/modules/logger"

	"github.com/golang-jwt/jwt/v5"
	"gitlab.com/shar-workflow/shar/client"
	"gitlab.com/shar-workflow/shar/model"
	"go.uber.org/fx"
)

var GoogleSheetFn func(
	ctx context.Context,
	cl client.JobClient,
	vars model.Vars,
) (model.Vars, error)

var GoogleSheetFnAssign = func(gsf func(
	ctx context.Context,
	cl client.JobClient,
	vars model.Vars,
) (model.Vars, error)) {
	// Save the function with its dependencies injected
	GoogleSheetFn = gsf
}

// TODO: output mapping
func NewGoogleSheetFn(uc *GoogleSheetUseCase) func(
	ctx context.Context,
	cl client.JobClient,
	vars model.Vars,
) (model.Vars, error) {
	return func(ctx context.Context, cl client.JobClient, vars model.Vars) (model.Vars, error) {
		// get the sheet id and range from the vars
		uc.Logger.Debug("Context", "ctx", ctx)
		uc.Logger.Debug("Getting sheet data", "vars", vars)
		sheetId, ok := vars["sheetId"].(string)
		if !ok {
			return nil, errors.New("sheetId not found in vars")
		}
		range_, ok := vars["range"].(string)
		if !ok {
			return nil, errors.New("range not found in vars")
		}
		email, ok := vars["_localContext_user"].(string)
		if !ok {
			return nil, errors.New("user not found in vars")
		}

		// set the context
		ctx = context.WithValue(ctx, domain.UserKey, email)

		// call the use case
		rawData, err := uc.GetSheetData(ctx, sheetId, range_)
		if err != nil {
			uc.Logger.Error("Error getting sheet data", "err", err)
			return nil, err
		}

		// Convert rawData to string
		data := fmt.Sprintf("%v", rawData)

		uc.Logger.Debug("Got sheet data", "data", data)

		// map the data to the vars
		vars["sheetData"] = data

		return vars, nil
	}
}

type (
	GoogleSheetParams struct {
		fx.In

		logger.Logger
		config.Config
	}

	// This Google Sheet use case will include:
	// - Fetching the access token needed to access the Google Sheet API
	// - Fetching the data from the Google Sheet
	// - Updating the data in the Google Sheet
	GoogleSheetUseCase struct {
		logger.Logger
		config.Config
		*apiservice.ApiService
	}
)

// NewGoogleSheetUseCase creates a new Google Sheet use case
func NewGoogleSheetUseCase(p GoogleSheetParams) *GoogleSheetUseCase {
	return &GoogleSheetUseCase{
		Logger: p.Logger,
		Config: p.Config,
		ApiService: apiservice.NewApiService(apiservice.ApiServiceConfig{
			BaseUrl: p.Config.GetApiConfig().AuthApiBaseUrl,
		}),
	}
}

// GetSheetData fetches the data from the given Google Sheet
func (uc *GoogleSheetUseCase) GetSheetData(ctx context.Context, sheetId string, range_ string) ([][]interface{}, error) {
	// get the email from context user and generate a token to request to internal api
	email, ok := ctx.Value(domain.UserKey).(string)
	if !ok {
		return nil, errors.New("user not found in context")
	}

	// get the access token from the internal api
	// first generate the token and set as the header
	atk := jwt.New(jwt.SigningMethodHS256)
	atk.Claims = jwt.MapClaims{
		"email": email,
		"exp":   time.Now().Add(time.Minute * 5).Unix(),
	}

	at, err := atk.SignedString([]byte(uc.Config.GetJwtSecret()))
	if err != nil {
		return nil, err
	}

	uc.ApiService.SetBearerToken(at)

	// get the access token from the internal api
	resp, err := uc.ApiService.Get("/api/v1/access_token/google")
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("internal api error")
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// extract the token from the response, "access_token": "..."
	var atResp struct {
		AccessToken string `json:"access_token"`
	}
	err = json.Unmarshal(body, &atResp)
	if err != nil {
		return nil, err
	}

	// get the data from the google sheet
	gs, err := googlesheet.NewGoogleSheetServiceWithToken(atResp.AccessToken)
	if err != nil {
		return nil, err
	}

	return gs.GetSheetData(ctx, sheetId, range_)

}
