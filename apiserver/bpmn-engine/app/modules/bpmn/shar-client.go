package bpmn

import (
	"context"
	"yalc/bpmn-engine/modules/config"

	"gitlab.com/shar-workflow/shar/client"
	"gitlab.com/shar-workflow/shar/client/taskutil"
)

type (
	sharClient struct {
		connCtx context.Context
		client  *client.Client
		config  config.Config
	}
)

func NewSharClient() *sharClient {
	return &sharClient{
		connCtx: context.Background(),
		client:  client.New(),
	}
}

func (s *sharClient) Connect() error {
	return s.client.Dial(s.connCtx, s.config.GetNatsURL())
}

func (s *sharClient) Close() error {
	s.Shutdown()
	return nil
}

// LoadBPMN loads the bpmn definition
func (s *sharClient) LoadBPMN(ctx context.Context, bpmnID string, bpmnDef []byte) error {
	_, err := s.client.LoadBPMNWorkflowFromBytes(ctx, bpmnID, bpmnDef)
	return err
}

// StartProcessInstance starts a process instance and returns the process instance id and the process execution id
// The task specification is registered with the shar client before the process instance is started
// Variable mapping is done using the vars map
func (s *sharClient) StartProcessInstance(ctx context.Context, processID string, vars map[string]interface{}) (string, string, error) {
	return s.client.LaunchProcess(ctx, processID, vars)
}

// RegisterTaskSpecification registers a task specification
func (s *sharClient) RegisterTaskSpecification(ctx context.Context, path string, f client.ServiceFn) error {
	return taskutil.RegisterTaskYamlFile(ctx, s.client, path, f)
}

func (s *sharClient) Shutdown() {
	s.client.Shutdown()
}
