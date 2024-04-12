package workflow

import (
	"time"
	"yalc/bpmn-engine/domain"

	validation "github.com/go-ozzo/ozzo-validation/v4"
)

type (
	WorkflowLaunchRequest struct {
		WorkflowID        string `json:"workflow_id"`
		ProcessDefinition string `json:"process_definition"` // base64 encoded bpmn file
		VariableMapping   string `json:"variable_mapping"`   // TODO: mutiple start event? how to
	}

	WorkflowStatusResponse struct {
		CurrentNode string    `json:"current_node"`
		Health      string    `json:"health"`
		Logs        []TaskLog `json:"logs"`
	}
	// TaskLog is the log of a service task or user task
	TaskLog struct {
		Id       string    `json:"id"`
		Subject  string    `json:"subject"`
		Received time.Time `json:"received"`

		Payload string `json:"payload"`
	}

	LaunchStatus struct {
		ProcessInstanceID string `json:"process_instance_id"`
		WorkflowID        string `json:"workflow_id"`
	}

	CompleteUserTaskRequest struct {
		Assignee string                 `json:"assignee"`
		Vars     map[string]interface{} `json:"vars"`
	}

	CompleteUserTaskResponse struct {
		Vars map[string]interface{} `json:"vars"`
	}
)

var _ domain.Object = (*WorkflowLaunchRequest)(nil)
var _ domain.Object = (*WorkflowStatusResponse)(nil)

func (w *WorkflowLaunchRequest) Validate() error {
	return validation.ValidateStruct(w,
		validation.Field(&w.WorkflowID, validation.Required),
		validation.Field(&w.ProcessDefinition, validation.Required),
		validation.Field(&w.VariableMapping, validation.Required),
	)
}

func (w *WorkflowStatusResponse) Validate() error {
	return validation.ValidateStruct(w,
		validation.Field(&w.CurrentNode, validation.Required),
		validation.Field(&w.Health, validation.Required),
		validation.Field(&w.Logs, validation.Required),
	)
}
