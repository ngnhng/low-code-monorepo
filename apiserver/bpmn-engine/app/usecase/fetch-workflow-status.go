package usecase

import (
	"context"
	"yalc/bpmn-engine/domain/workflow"
	executionlog "yalc/bpmn-engine/modules/bpmn/execution-log"
	"yalc/bpmn-engine/modules/config"
	"yalc/bpmn-engine/modules/logger"

	"go.uber.org/fx"
)

type (
	FetchWorkflowStatusUseCase struct {
		Config config.Config
		Logger logger.Logger

		*executionlog.ExecutionLogger
	}

	Params struct {
		fx.In

		Config     config.Config
		Logger     logger.Logger
		ExecLogger *executionlog.ExecutionLogger
	}
)

func NewFetchWorkflowStatusUseCase(p Params) *FetchWorkflowStatusUseCase {
	return &FetchWorkflowStatusUseCase{
		Config:          p.Config,
		Logger:          p.Logger,
		ExecutionLogger: p.ExecLogger,
	}
}

func (f *FetchWorkflowStatusUseCase) FetchWorkflowStatus(
	ctx context.Context,
	instanceId string,
	statusCh chan *workflow.WorkflowStatusResponse,
	errCh chan error,
) {
	f.Logger.Debug("Fetching workflow status: ", "instanceId: ", instanceId)
	logCh := make(chan workflow.TaskLog)
	defer close(statusCh)

	go func() {
		f.GetServiceTaskLogById(ctx, instanceId, logCh, errCh)
	}()

	for {
		select {
		case logs, ok := <-logCh:
			if !ok {
				// logCh was closed, so return from the function
				return
			}

			f.Logger.Debug("Sending logs to status channel: ", logs)

			statusCh <- &workflow.WorkflowStatusResponse{
				CurrentNode: logs.Id,
				Health:      "healthy",
				Logs:        []workflow.TaskLog{logs},
			}
			//case <-ctx.Done():
			//	f.Logger.Debug("Context cancelled")
			//	// The context was cancelled, so return from the function
			//	return
		}
	}
}
