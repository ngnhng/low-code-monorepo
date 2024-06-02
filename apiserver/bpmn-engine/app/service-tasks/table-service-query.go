package servicetasks

import (
	"github.com/goccy/go-yaml"
	"gitlab.com/shar-workflow/shar/model"
)

var TableServiceQueryTask = &model.TaskSpec{
	Version: "1.0",
	Kind:    "ServiceTask",
	Metadata: &model.TaskMetadata{
		Type:        "tableServiceQuery",
		Version:     "1.0",
		Description: "Table Service Query Task",
	},
	Behaviour: &model.TaskBehaviour{
		EstimatedMaxDuration: 200000,
		DefaultRetry: &model.DefaultTaskRetry{
			Number:        1,
			Strategy:      30000,
			InitMilli:     10000,
			IntervalMilli: 50000,
			MaxMilli:      60000,
			DefaultExceeded: &model.DefaultRetryExceededBehaviour{
				Action:    1,
				ErrorCode: "501",
			},
		},
		Unsafe: false,
		Mock:   false,
	},
	Parameters: &model.TaskParameters{
		Input: []*model.Parameter{
			{Name: "tableId", Description: "Table ID", Type: "string", Mandatory: true},
			{Name: "sqlQuery", Description: "Range to read", Type: "string", Mandatory: true},
		},
	},
}

var TableServiceQueryTaskSpec, _ = yaml.Marshal(TableServiceQueryTask)
