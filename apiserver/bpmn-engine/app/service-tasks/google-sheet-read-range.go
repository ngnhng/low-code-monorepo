package servicetasks

import (
	"github.com/goccy/go-yaml"
	"gitlab.com/shar-workflow/shar/model"
)

var GoogleSheetReadRangeTask = &model.TaskSpec{
	Version: "1.0",
	Kind:    "ServiceTask",
	Metadata: &model.TaskMetadata{
		Type:        "googleSheetReadRange",
		Version:     "1.0",
		Description: "Google Sheet Read Range Task",
	},
	Behaviour: &model.TaskBehaviour{
		EstimatedMaxDuration: 200000,
		DefaultRetry: &model.DefaultTaskRetry{
			Number:        5,
			Strategy:      30000,
			InitMilli:     10000,
			IntervalMilli: 50000,
			MaxMilli:      60000,
			DefaultExceeded: &model.DefaultRetryExceededBehaviour{
				Action: 3,
			},
		},
		Unsafe: false,
		Mock:   false,
	},
	Parameters: &model.TaskParameters{
		Input: []*model.Parameter{
			{Name: "sheetId", Description: "Google Sheet ID", Type: "string", Mandatory: true},
			{Name: "range", Description: "Range to read", Type: "string", Mandatory: true},
		},
	},
}

var GoogleSheetReadRangeTaskSpec, _ = yaml.Marshal(GoogleSheetReadRangeTask)