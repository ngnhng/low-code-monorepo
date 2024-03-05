package usecase

import (
	"context"
	domain "yalc/bpmn-engine/domain/workflow"
	"yalc/bpmn-engine/modules/bpmn"
)

type (
	LaunchWorkflowUseCase interface {
		Execute(*domain.WorkflowLaunchRequest) error
	}

	launchWorkflowUseCase struct {
		engineClient bpmn.EngineClient
	}
)

func NewLaunchWorkflowUseCase(engineClient bpmn.EngineClient) LaunchWorkflowUseCase {
	return &launchWorkflowUseCase{
		engineClient: engineClient,
	}
}

func (uc *launchWorkflowUseCase) Execute(request *domain.WorkflowLaunchRequest) error {
	// TODO: goroutine per connection to nats
	executionContext := context.WithValue(context.Background(), "workflow_id", request.WorkflowID)
	// set cancel context
	executionContext, cancel := context.WithCancel(executionContext)
	defer cancel()

	if err := uc.engineClient.LoadBPMN(executionContext, request.WorkflowID, request.ProcessDefinition); err != nil {
		return err
	}

	return nil
}
