package bpmn

import "context"

type (
	EngineClient interface {
		// Connect connects to the message broker
		Connect() error
		// Close closes the connection to the message broker
		Close() error
		// LoadBPMN loads the bpmn definition
		LoadBPMN(ctx context.Context, bpmnID string, bpmnDef []byte) error
		// StartProcessInstance starts a process instance
		StartProcessInstance(ctx context.Context, processID string, vars map[string]interface{}) (string, string, error)
	}
)

var _ EngineClient = &sharClient{}
