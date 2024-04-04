package workflow

//go:generate mockery

import (
	"context"
	"gitlab.com/shar-workflow/shar/common"
	"gitlab.com/shar-workflow/shar/model"
	"gitlab.com/shar-workflow/shar/server/services"
	"gitlab.com/shar-workflow/shar/server/services/storage"
)

// NatsService is the shar type responsible for interacting with NATS.
type NatsService interface {
	CheckProcessTaskDeprecation(ctx context.Context, workflow *model.Workflow, processName string) error
	CloseUserTask(ctx context.Context, trackingID string) error
	Conn() common.NatsConn
	CreateExecution(ctx context.Context, wfInstance *model.Execution) (*model.Execution, error)
	CreateJob(ctx context.Context, job *model.WorkflowState) (string, error)
	CreateProcessInstance(ctx context.Context, workflowInstanceID string, parentProcessID string, parentElementID string, processName string, workflowName string, workflowId string) (*model.ProcessInstance, error)
	DeleteJob(ctx context.Context, trackingID string) error
	DestroyProcessInstance(ctx context.Context, state *model.WorkflowState, pi *model.ProcessInstance, wi *model.Execution) error
	EnsureServiceTaskConsumer(ctx context.Context, uid string) error
	GetElement(ctx context.Context, state *model.WorkflowState) (*model.Element, error)
	GetExecution(ctx context.Context, workflowInstanceID string) (*model.Execution, error)
	GetGatewayInstance(ctx context.Context, gatewayInstanceID string) (*model.Gateway, error)
	GetGatewayInstanceID(state *model.WorkflowState) (string, string, error)
	GetJob(ctx context.Context, id string) (*model.WorkflowState, error)
	GetLatestVersion(ctx context.Context, workflowName string) (string, error)
	GetOldState(ctx context.Context, id string) (*model.WorkflowState, error)
	GetProcessHistory(ctx context.Context, processInstanceId string) ([]*model.ProcessHistoryEntry, error)
	GetProcessInstance(ctx context.Context, processInstanceID string) (*model.ProcessInstance, error)
	GetTaskSpecByUID(ctx context.Context, uid string) (*model.TaskSpec, error)
	GetTaskSpecUID(ctx context.Context, name string) (string, error)
	GetWorkflow(ctx context.Context, workflowID string) (*model.Workflow, error)
	GetWorkflowNameFor(ctx context.Context, processName string) (string, error)
	GetWorkflowVersions(ctx context.Context, workflowName string) (*model.WorkflowVersions, error)
	Heartbeat(ctx context.Context, request *model.HeartbeatRequest) error
	ListExecutionProcesses(ctx context.Context, id string) ([]string, error)
	ListExecutions(ctx context.Context, workflowName string) (chan *model.ListExecutionItem, chan error)
	ListWorkflows(ctx context.Context) (chan *model.ListWorkflowResponse, chan error)
	OwnerID(ctx context.Context, name string) (string, error)
	OwnerName(ctx context.Context, id string) (string, error)
	PublishMessage(ctx context.Context, name string, key string, vars []byte) error
	PublishWorkflowState(ctx context.Context, stateName string, state *model.WorkflowState, ops ...storage.PublishOpt) error
	PutTaskSpec(ctx context.Context, spec *model.TaskSpec) (string, error)
	RecordHistoryActivityComplete(ctx context.Context, state *model.WorkflowState) error
	RecordHistoryActivityExecute(ctx context.Context, state *model.WorkflowState) error
	RecordHistoryProcessAbort(ctx context.Context, state *model.WorkflowState) error
	RecordHistoryProcessComplete(ctx context.Context, state *model.WorkflowState) error
	RecordHistoryProcessSpawn(ctx context.Context, state *model.WorkflowState, newProcessInstanceID string) error
	RecordHistoryProcessStart(ctx context.Context, state *model.WorkflowState) error
	SaveState(ctx context.Context, id string, state *model.WorkflowState) error
	SetAbort(processor services.AbortFunc)
	SetCompleteActivity(processor services.CompleteActivityFunc)
	SetCompleteActivityProcessor(processor services.CompleteActivityProcessorFunc)
	SetCompleteJobProcessor(processor services.CompleteJobProcessorFunc)
	SetEventProcessor(processor services.EventProcessorFunc)
	SetLaunchFunc(processor services.LaunchFunc)
	SetMessageProcessor(processor services.MessageProcessorFunc)
	SetTraversalProvider(provider services.TraversalFunc)
	Shutdown()
	StartProcessing(ctx context.Context) error
	StoreWorkflow(ctx context.Context, wf *model.Workflow) (string, error)
	XDestroyProcessInstance(ctx context.Context, state *model.WorkflowState) error
}
