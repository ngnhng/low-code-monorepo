package servicetasks

import (
	"github.com/goccy/go-yaml"
	"gitlab.com/shar-workflow/shar/model"
)

var MailerSendSendMailTask = &model.TaskSpec{
	Version: "1.0",
	Kind:    "ServiceTask",
	Metadata: &model.TaskMetadata{
		Type:        "mailersendSendMail",
		Version:     "1.0",
		Description: "MailerSend Send Mail Task",
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
			{Name: "mailSubject", Description: "Mail Subject", Type: "string", Mandatory: true},
			{Name: "mailText", Description: "Mail Body", Type: "string", Mandatory: true},
			{Name: "mailTo", Description: "Mail To", Type: "string", Mandatory: true},
		},
	},
}

var MailerSendSendMailTaskSpec, _ = yaml.Marshal(MailerSendSendMailTask)
