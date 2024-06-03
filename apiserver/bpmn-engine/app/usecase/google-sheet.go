package usecase

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"
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

var (
	GoogleSheetWriteAppendFn func(
		ctx context.Context,
		cl client.JobClient,
		vars model.Vars,
	) (model.Vars, error)

	GoogleSheetWriteAppendFnAssign = func(gsf func(
		ctx context.Context,
		cl client.JobClient,
		vars model.Vars,
	) (model.Vars, error)) {
		// Save the function with its dependencies injected
		GoogleSheetWriteAppendFn = gsf
	}
)

func NewGoogleSheetWriteAppendFn(uc *GoogleSheetUseCase) func(
	ctx context.Context,
	cl client.JobClient,
	vars model.Vars,
) (model.Vars, error) {
	return func(ctx context.Context, cl client.JobClient, vars model.Vars) (model.Vars, error) {

		// get the sheet id and range from the vars
		uc.Logger.Debug("Getting sheet data", vars)
		sheetId, range_, email, data, err := validateGoogleSheetWriteAppendVars(vars)
		if err != nil {
			uc.Logger.Errorf("Error validating vars: %v", err)
			return nil, err
		}

		uc.Logger.Debugf("Data: %v", data)

		// set the context
		ctx = context.WithValue(ctx, domain.UserKey, email)

		// given that data is a string of the format [['string', var]]
		// replace single quotes with double quotes
		data = strings.ReplaceAll(data, "'", "\"")

		// Replace variables not surrounded by quotes with their values
		for key, value := range vars {
			uc.Logger.Debugf("Key: %v, Value: %v", key, value)
			// Create a regular expression to match variables not surrounded by quotes
			re := regexp.MustCompile(`(?m)\b` + key + `\b`)

			// Replace the variable with its value if it's not surrounded by quotes
			data = re.ReplaceAllStringFunc(data, func(s string) string {
				if s == key {
					return fmt.Sprintf(`"%v"`, value)
				}
				return s
			})
		}

		uc.Logger.Debugf("Data after replacing variables: %v", data)

		// Unmarshal the data into a [][]interface{}
		values := make([][]interface{}, len(data))
		err = json.Unmarshal([]byte(data), &values)
		if err != nil {
			uc.Logger.Errorf("Error unmarshalling sheet data: %v", err)
			return nil, err
		}

		uc.Logger.Debugf("Values: %v", values)

		err = uc.AppendData(ctx, sheetId, range_, values)
		if err != nil {
			uc.Logger.Errorf("Error appending data to sheet: %v", err)
			return nil, err
		}

		vars["sheetData"] = data

		return vars, nil
	}
}

func validateGoogleSheetWriteAppendVars(vars model.Vars) (sheetId string, range_ string, user string, data string, err error) {
	sheetId, ok := vars["sheetId"].(string)
	if !ok {
		return "", "", "", "", fmt.Errorf("expected string for key 'sheetId', got %T", vars["sheetId"])
	}
	range_, ok = vars["workSheet"].(string)
	if !ok {
		return "", "", "", "", fmt.Errorf("expected string for key 'range', got %T", vars["workSheet"])
	}
	user, ok = vars["_localContext_user"].(string)
	if !ok {
		return "", "", "", "", fmt.Errorf("expected string for key '_localContext_user', got %T", vars["_localContext_user"])
	}
	data, ok = vars["rowData"].(string)
	if !ok {
		return "", "", "", "", fmt.Errorf("expected string for key 'sheetData', got %T", vars["rowData"])
	}

	return
}

var (
	GoogleSheetReadSingleRangeFn func(
		ctx context.Context,
		cl client.JobClient,
		vars model.Vars,
	) (model.Vars, error)

	GoogleSheetReadSingleRangeFnAssign = func(gsf func(
		ctx context.Context,
		cl client.JobClient,
		vars model.Vars,
	) (model.Vars, error)) {
		// Save the function with its dependencies injected
		GoogleSheetReadSingleRangeFn = gsf
	}
)

// TODO: output mapping
func NewGoogleSheetReadSingleRangeFn(uc *GoogleSheetUseCase) func(
	ctx context.Context,
	cl client.JobClient,
	vars model.Vars,
) (model.Vars, error) {
	return func(ctx context.Context, cl client.JobClient, vars model.Vars) (model.Vars, error) {
		// get the sheet id and range from the vars
		uc.Logger.Debug("Getting sheet data", vars)
		sheetId, range_, email, err := validateGoogleSheetReadSingleRangeVars(vars)
		if err != nil {
			return nil, err
		}

		// set the context
		ctx = context.WithValue(ctx, domain.UserKey, email)

		// call the use case
		rawData, err := uc.GetSheetData(ctx, sheetId, range_)
		if err != nil {
			uc.Logger.Error("Error getting sheet data", "err", err)
			return vars, err
		}

		uc.Logger.Debugf("Raw sheet data value: %v", rawData)
		uc.Logger.Debugf("Raw sheet data type: %T", rawData)

		// Convert rawData to string
		data := fmt.Sprintf("%v", rawData)

		uc.Logger.Debug("Got sheet data", "data", data)

		// map the data to the vars
		vars["sheetData"] = data

		return vars, nil
	}
}

func validateGoogleSheetReadSingleRangeVars(vars model.Vars) (sheetId string, range_ string, user string, err error) {

	sheetId, ok := vars["sheetId"].(string)
	if !ok {
		return "", "", "", fmt.Errorf("expected string for key 'sheetId', got %T", vars["sheetId"])
	}
	range_, ok = vars["range"].(string)
	if !ok {
		return "", "", "", fmt.Errorf("expected string for key 'range', got %T", vars["range"])
	}
	user, ok = vars["_localContext_user"].(string)
	if !ok {
		return "", "", "", fmt.Errorf("expected string for key '_localContext_user', got %T", vars["_localContext_user"])
	}
	return
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
			BaseUrl: p.Config.GetConfig().ApiConfig.AuthApiBaseUrl,
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

	at, err := atk.SignedString([]byte(uc.Config.GetConfig().JwtSecret))
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

// AppendData appends the data to the given Google Sheet
func (uc *GoogleSheetUseCase) AppendData(ctx context.Context, sheetId string, range_ string, data [][]interface{}) error {
	// get the email from context user and generate a token to request to internal api
	email, ok := ctx.Value(domain.UserKey).(string)
	if !ok {
		return errors.New("user not found in context")
	}

	// get the access token from the internal api
	// first generate the token and set as the header
	atk := jwt.New(jwt.SigningMethodHS256)
	atk.Claims = jwt.MapClaims{
		"email": email,
		"exp":   time.Now().Add(time.Minute * 5).Unix(),
	}

	at, err := atk.SignedString([]byte(uc.Config.GetConfig().JwtSecret))
	if err != nil {
		return err
	}

	uc.ApiService.SetBearerToken(at)

	// get the access token from the internal api
	resp, err := uc.ApiService.Get("/api/v1/access_token/google")
	if err != nil {
		return err
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return errors.New("internal api error")
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	// extract the token from the response, "access_token": "..."
	var atResp struct {
		AccessToken string `json:"access_token"`
	}
	err = json.Unmarshal(body, &atResp)
	if err != nil {
		return err
	}

	// get the data from the google sheet
	gs, err := googlesheet.NewGoogleSheetServiceWithToken(atResp.AccessToken)
	if err != nil {
		return err
	}

	return gs.AppendSheetData(ctx, sheetId, range_, data)
}
