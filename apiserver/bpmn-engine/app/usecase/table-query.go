package usecase

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"
	"yalc/bpmn-engine/domain"
	apiservice "yalc/bpmn-engine/modules/api-service"
	"yalc/bpmn-engine/modules/config"
	"yalc/bpmn-engine/modules/logger"

	"github.com/golang-jwt/jwt/v5"
	"gitlab.com/shar-workflow/shar/client"
	"gitlab.com/shar-workflow/shar/model"
	"go.uber.org/fx"
)

type (
	TableQueryParams struct {
		fx.In

		Logger logger.Logger
		Config config.Config
	}

	TableQueryUseCase struct {
		Logger logger.Logger
		Config config.Config
		*apiservice.ApiService
	}
)

func NewTableQueryUseCase(p TableQueryParams) *TableQueryUseCase {
	return &TableQueryUseCase{
		Logger: p.Logger,
		Config: p.Config,
		ApiService: apiservice.NewApiService(apiservice.ApiServiceConfig{
			BaseUrl: p.Config.GetConfig().ApiConfig.TableApiBaseUrl,
		}),
	}
}

var (
	TableQuerySingleRecordFn func(
		ctx context.Context,
		cl client.JobClient,
		vars model.Vars,
	) (model.Vars, error)

	TableQuerySingleRecordFnAssign = func(tqf func(
		ctx context.Context,
		cl client.JobClient,
		vars model.Vars,
	) (model.Vars, error)) {
		TableQuerySingleRecordFn = tqf
	}
)

func NewTableQuerySingleRecordFn(uc *TableQueryUseCase) func(
	ctx context.Context,
	cl client.JobClient,
	vars model.Vars,
) (model.Vars, error) {
	return func(ctx context.Context, cl client.JobClient, vars model.Vars) (model.Vars, error) {
		// get the projectId, table and query from the vars
		uc.Logger.Debug("Getting table data", vars)
		projectId, table, query, email, err := validateTableQuerySingleRecordVars(vars)
		if err != nil {
			uc.Logger.Errorf("Error validating vars: %v", err)
			return nil, err
		}

		uc.Logger.Debugf("Args: %v, %v, %v", projectId, table, query)
		ctx = context.WithValue(ctx, domain.UserKey, email)

		// pre process the query, if a variable is found, replace it with the value
		// a variable is defined as VAR_name
		// the value of the variable is taken from the vars
		// if the variable is not found in the vars, an error will be returned
		// the variable is replaced with the value in the query

		// get the variable from the query
		// the variable is defined as VAR_name
		// sample query: (name = VAR_name)
		// try to replace VAR_name with vars["name"]

		re := regexp.MustCompile(`VAR_(\w+)`)
		matches := re.FindAllStringSubmatch(query, -1)

		for _, match := range matches {
			varName := match[1]
			varValue, ok := vars[varName]
			if !ok {
				return nil, fmt.Errorf("variable %s not found in vars", varName)
			}

			query = strings.Replace(query, "VAR_"+varName, varValue.(string), -1)
		}

		// Query the table
		result, err := uc.QuerySingleRecord(ctx, table, projectId, query)
		if err != nil {
			uc.Logger.Errorf("Error querying table: %v", err)
			return nil, err
		}

		uc.Logger.Debugf("Result: %v", result)

		// set the result to the vars
		//vars["result"] = result
		for k, v := range result {
			vars[k] = v
		}

		return vars, nil
	}
}

func validateTableQuerySingleRecordVars(vars model.Vars) (projectId, table, query, email string, err error) {
	projectId, ok := vars["_localContext_projectId"].(string)
	if !ok {
		return "", "", "", "", fmt.Errorf("expected string for key 'projectId', got %T", vars["projectId"])
	}

	table, ok = vars["tableId"].(string)
	if !ok {
		return "", "", "", "", fmt.Errorf("expected string for key 'table', got %T", vars["table"])
	}

	query, ok = vars["sqlQuery"].(string)
	if !ok {
		return "", "", "", "", fmt.Errorf("expected string for key 'query', got %T", vars["query"])
	}

	email, ok = vars["_localContext_user"].(string)
	if !ok {
		return "", "", "", "", fmt.Errorf("expected string for key '_localContext_user', got %T", vars["_localContext_user"])
	}

	return projectId, table, query, email, nil
}

// QuerySingleRecord queries a single record from the table
// If multiple or no records are found, an error will be returned
func (uc *TableQueryUseCase) QuerySingleRecord(ctx context.Context, table string, projectId, query string) (map[string]interface{}, error) {
	// get the email from context user and generate a token to request to internal api
	email, ok := ctx.Value(domain.UserKey).(string)
	if !ok {
		return nil, errors.New("user not found in context")
	}

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

	// Query the table
	// POST /projects/:projectsId/tables/:tablesId/query
	// {
	//	"sql": "( name = ? )",
	//	"params": [
	//		"John Doeeew"
	//	]
	//}

	body := struct {
		Sql    string        `json:"sql"`
		Params []interface{} `json:"params"`
	}{
		Sql:    query,
		Params: []interface{}{},
	}

	bodyBytes, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}
	res, err := uc.ApiService.Post(fmt.Sprintf("/projects/%s/tables/%s/query", projectId, table), bodyBytes)
	if err != nil {
		return nil, err
	}

	defer res.Body.Close()

	if res.StatusCode != 200 {
		return nil, errors.New("internal api error")
	}

	var result struct {
		Data     []map[string]interface{} `json:"data"`
		PageInfo struct {
			TotalCount int `json:"totalCount"`
		} `json:"pageInfo"`
	}
	err = json.NewDecoder(res.Body).Decode(&result)
	if err != nil {
		return nil, err
	}

	uc.Logger.Debugf("Result: %v", result)

	if len(result.Data) != 1 {
		return nil, errors.New("expected 1 record, got multiple or none")
	}

	return result.Data[0], nil
}
