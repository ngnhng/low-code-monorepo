package usecase

import (
	"context"
	executionlog "yalc/bpmn-engine/modules/bpmn/execution-log"
	"yalc/bpmn-engine/modules/config"
	"yalc/bpmn-engine/modules/logger"

	"go.uber.org/fx"
)

type (
	FetchWorkflowStatusUseCaseV2 struct {
		Config config.Config
		Logger logger.Logger

		*executionlog.ExecutionLogger
	}

	FetchWorkflowStatusV2Params struct {
		fx.In

		Config     config.Config
		Logger     logger.Logger
		ExecLogger *executionlog.ExecutionLogger
	}

	WorkflowStatus struct {
		Activities []Activity `json:"activities"`
	}

	Activity struct {
		Id   string `json:"id"`
		Name string `json:"name"`
		Type string `json:"type"`
	}
)

func NewFetchWorkflowStatusUseCaseV2(p FetchWorkflowStatusV2Params) *FetchWorkflowStatusUseCaseV2 {
	return &FetchWorkflowStatusUseCaseV2{
		Config:          p.Config,
		Logger:          p.Logger,
		ExecutionLogger: p.ExecLogger,
	}
}

func (f *FetchWorkflowStatusUseCaseV2) Execute(
	ctx context.Context,
	instanceId string,
) (*Activity, error) {
	f.Logger.Debug("Fetching workflow status: ", "instanceId: ", instanceId)

	// we try to get a snapshot of the workflow status from NATS stream via http polling
	logs, err := f.ExecutionLogger.GetServiceTaskLogSnapshot(
		ctx,
		instanceId,
		10,
	)

	if err != nil {
		return nil, err
	}

	f.Logger.Debugf("Logs: %+v", logs)

	return nil, nil
}
