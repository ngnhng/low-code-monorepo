package usecase

import (
	"context"
	"yalc/bpmn-engine/domain/workflow"
	"yalc/bpmn-engine/modules/bpmn"
	"yalc/bpmn-engine/modules/config"
	"yalc/bpmn-engine/modules/logger"

	"go.uber.org/fx"
)

type (
	CompleteUserTaskUseCase struct {
		Config config.Config
		Logger logger.Logger

		engineClient *bpmn.SharClient
	}

	CompleteUserTaskUseCaseParams struct {
		fx.In

		Config config.Config
		Logger logger.Logger
		*bpmn.SharClient
	}
)

func NewCompleteUserTaskUseCase(p CompleteUserTaskUseCaseParams) *CompleteUserTaskUseCase {
	return &CompleteUserTaskUseCase{
		Config:       p.Config,
		Logger:       p.Logger,
		engineClient: p.SharClient,
	}
}

// Execute the complete user task use case
func (uc *CompleteUserTaskUseCase) Execute(ctx context.Context, workflow, instanceId string, req workflow.CompleteUserTaskRequest) (map[string]any, error) {
	uc.Logger.Debug("Starting complete user task use case")

	// complete the user task
	if client := uc.engineClient.GetClient(); client != nil {
		task, err := client.ListUserTaskIDs(ctx, req.Assignee)
		uc.Logger.Debug("ListUserTaskIDs: ", task.Id, err)
		uc.Logger.Debug("Instance ID: ", workflow)
		if err != nil || len(task.Id) == 0 {
			return nil, err
		}
		err = client.CompleteUserTask(ctx, req.Assignee, workflow, req.Vars)
		if err != nil {
			return nil, err
		}
	}

	return req.Vars, nil
}
