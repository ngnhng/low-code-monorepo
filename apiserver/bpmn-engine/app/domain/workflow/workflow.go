package workflow

import (
	"time"
	"yalc/bpmn-engine/domain"

	validation "github.com/go-ozzo/ozzo-validation/v4"
)

type (
	WorkflowLaunchRequest struct {
		WorkflowID        string `json:"workflow_id"`
		ProcessDefinition []byte `json:"process_definition"`
		VariableMapping   []byte `json:"variable_mapping"` // mutiple start event? how to
	}

	WorkflowStatusResponse struct {
		WorkflowID  string                 `json:"workflow_id"`
		CurrentNode string                 `json:"current_node"`
		Health      string                 `json:"health"`
		Logs        map[time.Time][]string `json:"logs"`
	}
)

var _ domain.Object = (*WorkflowLaunchRequest)(nil)
var _ domain.Object = (*WorkflowStatusResponse)(nil)

func (w *WorkflowLaunchRequest) Validate() error {
	return validation.ValidateStruct(w,
		validation.Field(&w.WorkflowID, validation.Required),
		validation.Field(&w.ProcessDefinition, validation.Required),
	)
}

func (w *WorkflowStatusResponse) Validate() error {
	return validation.ValidateStruct(w,
		validation.Field(&w.WorkflowID, validation.Required),
		validation.Field(&w.CurrentNode, validation.Required),
		validation.Field(&w.Health, validation.Required),
		validation.Field(&w.Logs, validation.Required),
	)
}
