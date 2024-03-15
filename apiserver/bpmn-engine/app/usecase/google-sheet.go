package usecase

import (
	"context"
	"errors"
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
		//data, err := uc.GetSheetData(ctx, vars["sheetId"].(string), vars["range"].(string), vars["token"].(string))
		//if err != nil {
		//	return nil, err
		//}
		uc.Logger.Debug("Context: ", ctx)
		vars["localVar"] = "LocalVar"
		uc.Logger.Debug("Vars: ", vars)

		// mock the output mapping
		vars["myCounter"] = 5

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
func (uc *GoogleSheetUseCase) GetSheetData(ctx context.Context, sheetId string, range_ string, token string) ([][]interface{}, error) {
	// get the email from context user and generate a token to request to internal api
	user, ok := ctx.Value(domain.UserKey).(*jwt.Token)
	if !ok {
		return nil, errors.New("user not found in context")
	}

	claims, ok := user.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("user claims not found in context")
	}

	email, ok := claims["email"].(string)
	if !ok {
		return nil, errors.New("user email not found in context")
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
	resp, err := uc.ApiService.Get("/api/v1/oauth/google/token")
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

	// get the data from the google sheet
	gs, err := googlesheet.NewGoogleSheetServiceWithToken(string(body))
	if err != nil {
		return nil, err
	}

	return gs.GetSheetData(ctx, sheetId, range_)

}
