package main

import (
	"fmt"
	"github.com/goccy/go-yaml"
	"gitlab.com/shar-workflow/shar/model"
)

func main() {
	grp1 := "address1"
	td := model.TaskSpec{
		Version: "1.0",
		Kind:    "ServiceTask",
		Metadata: &model.TaskMetadata{
			Uid:         "LookupAddressV1",
			Type:        "LookupAddress",
			Version:     "0.1",
			Short:       "Look up address",
			Description: "Looks up a postal address from a PAF API",
			Labels:      []string{"address", "postcode"},
		},
		Behaviour: &model.TaskBehaviour{
			EstimatedMaxDuration: 2343255,
			DefaultRetry: &model.DefaultTaskRetry{
				Number:        30,
				Strategy:      30000,
				InitMilli:     30000,
				IntervalMilli: 10000,
				MaxMilli:      120000,
				DefaultExceeded: &model.DefaultRetryExceededBehaviour{
					Action: model.RetryErrorAction_FailWorkflow,
				},
			},
			Unsafe: false,
		},
		Parameters: &model.TaskParameters{
			ParameterGroup: []*model.ParameterGroup{
				{Name: grp1, Short: "Address parameters", Description: "Address parameters"},
			},
			Input: []*model.Parameter{
				{Name: "number", Short: "House", Description: "House number", Type: "int", Group: &grp1, ExtensionData: map[string]string{"name1": "value1"}, Mandatory: true, ValidateExpr: "param[\"number\"] matches \"[0-9]*\""},
				{Name: "postcode", Short: "Postal code", Description: "UK postal code", Type: "string", Group: &grp1},
			},
			Output: []*model.Parameter{
				{Name: "streetName", Short: "Street Name", Description: "Street or road name", Type: "string"},
				{Name: "county", Short: "County", Description: "Administrative county", Type: "string"},
			},
		},
		Events: &model.TaskEvents{
			Error: []*model.TaskError{
				{Name: "ServiceDown", Code: "500"},
			},
			Message: []*model.Message{
				{Name: "BlacklistedPostcode", CorrelationKey: "=postcode"},
			},
		},
	}
	y, err := yaml.Marshal(td)
	if err != nil {
		panic(err)
	}
	fmt.Println(string(y))

}
