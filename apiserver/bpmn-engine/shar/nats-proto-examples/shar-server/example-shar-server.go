package main
// TODO: WARNING  - this example code will be overwritten upon generation.  Copy elsewhere to modify.
import (
    "context"
    "github.com/nats-io/nats.go"
    "gitlab.com/shar-workflow/shar/model"
    "gitlab.com/shar-workflow/shar/internal/natsrpc"
)


// SharAPI - an implementation of a Shar server.
type SharAPI struct {

}
// StoreWorkflow - The StoreWorkflow method.
func (a SharAPI) StoreWorkflow(ctx context.Context, req *model.StoreWorkflowRequest) (*model.StoreWorkflowResponse, error) {
    //TODO: implement Shar:StoreWorkflow
    panic("implement Shar:StoreWorkflow")
}
// CancelProcessInstance - The CancelProcessInstance method.
func (a SharAPI) CancelProcessInstance(ctx context.Context, req *model.CancelProcessInstanceRequest) (*model.CancelProcessInstanceResponse, error) {
    //TODO: implement Shar:CancelProcessInstance
    panic("implement Shar:CancelProcessInstance")
}
// LaunchProcess - The LaunchProcess method.
func (a SharAPI) LaunchProcess(ctx context.Context, req *model.LaunchWorkflowRequest) (*model.LaunchWorkflowResponse, error) {
    //TODO: implement Shar:LaunchProcess
    panic("implement Shar:LaunchProcess")
}
// ListWorkflows - The ListWorkflows method.
func (a SharAPI) ListWorkflows(ctx context.Context, req *model.ListWorkflowsRequest) (*model.ListWorkflowsResponse, error) {
    //TODO: implement Shar:ListWorkflows
    panic("implement Shar:ListWorkflows")
}
// ListExecutionProcesses - The ListExecutionProcesses method.
func (a SharAPI) ListExecutionProcesses(ctx context.Context, req *model.ListExecutionProcessesRequest) (*model.ListExecutionProcessesResponse, error) {
    //TODO: implement Shar:ListExecutionProcesses
    panic("implement Shar:ListExecutionProcesses")
}
// ListExecution - The ListExecution method.
func (a SharAPI) ListExecution(ctx context.Context, req *model.ListExecutionRequest) (*model.ListExecutionResponse, error) {
    //TODO: implement Shar:ListExecution
    panic("implement Shar:ListExecution")
}
// SendMessage - The SendMessage method.
func (a SharAPI) SendMessage(ctx context.Context, req *model.SendMessageRequest) (*model.SendMessageResponse, error) {
    //TODO: implement Shar:SendMessage
    panic("implement Shar:SendMessage")
}
// CompleteManualTask - The CompleteManualTask method.
func (a SharAPI) CompleteManualTask(ctx context.Context, req *model.CompleteManualTaskRequest) (*model.CompleteManualTaskResponse, error) {
    //TODO: implement Shar:CompleteManualTask
    panic("implement Shar:CompleteManualTask")
}
// CompleteServiceTask - The CompleteServiceTask method.
func (a SharAPI) CompleteServiceTask(ctx context.Context, req *model.CompleteServiceTaskRequest) (*model.CompleteServiceTaskResponse, error) {
    //TODO: implement Shar:CompleteServiceTask
    panic("implement Shar:CompleteServiceTask")
}
// CompleteUserTask - The CompleteUserTask method.
func (a SharAPI) CompleteUserTask(ctx context.Context, req *model.CompleteUserTaskRequest) (*model.CompleteUserTaskResponse, error) {
    //TODO: implement Shar:CompleteUserTask
    panic("implement Shar:CompleteUserTask")
}
// ListUserTaskIDs - The ListUserTaskIDs method.
func (a SharAPI) ListUserTaskIDs(ctx context.Context, req *model.ListUserTasksRequest) (*model.ListUserTasksResponse, error) {
    //TODO: implement Shar:ListUserTaskIDs
    panic("implement Shar:ListUserTaskIDs")
}
// GetUserTask - The GetUserTask method.
func (a SharAPI) GetUserTask(ctx context.Context, req *model.GetUserTaskRequest) (*model.GetUserTaskResponse, error) {
    //TODO: implement Shar:GetUserTask
    panic("implement Shar:GetUserTask")
}
// HandleWorkflowError - The HandleWorkflowError method.
func (a SharAPI) HandleWorkflowError(ctx context.Context, req *model.HandleWorkflowErrorRequest) (*model.HandleWorkflowErrorResponse, error) {
    //TODO: implement Shar:HandleWorkflowError
    panic("implement Shar:HandleWorkflowError")
}
// CompleteSendMessageTask - The CompleteSendMessageTask method.
func (a SharAPI) CompleteSendMessageTask(ctx context.Context, req *model.CompleteSendMessageRequest) (*model.CompleteSendMessageResponse, error) {
    //TODO: implement Shar:CompleteSendMessageTask
    panic("implement Shar:CompleteSendMessageTask")
}
// GetWorkflowVersions - The GetWorkflowVersions method.
func (a SharAPI) GetWorkflowVersions(ctx context.Context, req *model.GetWorkflowVersionsRequest) (*model.GetWorkflowVersionsResponse, error) {
    //TODO: implement Shar:GetWorkflowVersions
    panic("implement Shar:GetWorkflowVersions")
}
// GetWorkflow - The GetWorkflow method.
func (a SharAPI) GetWorkflow(ctx context.Context, req *model.GetWorkflowRequest) (*model.GetWorkflowResponse, error) {
    //TODO: implement Shar:GetWorkflow
    panic("implement Shar:GetWorkflow")
}
// GetProcessInstanceStatus - The GetProcessInstanceStatus method.
func (a SharAPI) GetProcessInstanceStatus(ctx context.Context, req *model.GetProcessInstanceStatusRequest) (*model.GetProcessInstanceStatusResponse, error) {
    //TODO: implement Shar:GetProcessInstanceStatus
    panic("implement Shar:GetProcessInstanceStatus")
}
// GetProcessHistory - The GetProcessHistory method.
func (a SharAPI) GetProcessHistory(ctx context.Context, req *model.GetProcessHistoryRequest) (*model.GetProcessHistoryResponse, error) {
    //TODO: implement Shar:GetProcessHistory
    panic("implement Shar:GetProcessHistory")
}
// GetVersionInfo - The GetVersionInfo method.
func (a SharAPI) GetVersionInfo(ctx context.Context, req *model.GetVersionInfoRequest) (*model.GetVersionInfoResponse, error) {
    //TODO: implement Shar:GetVersionInfo
    panic("implement Shar:GetVersionInfo")
}
// RegisterTask - The RegisterTask method.
func (a SharAPI) RegisterTask(ctx context.Context, req *model.RegisterTaskRequest) (*model.RegisterTaskResponse, error) {
    //TODO: implement Shar:RegisterTask
    panic("implement Shar:RegisterTask")
}
// GetTaskSpec - The GetTaskSpec method.
func (a SharAPI) GetTaskSpec(ctx context.Context, req *model.GetTaskSpecRequest) (*model.GetTaskSpecResponse, error) {
    //TODO: implement Shar:GetTaskSpec
    panic("implement Shar:GetTaskSpec")
}
// DeprecateServiceTask - The DeprecateServiceTask method.
func (a SharAPI) DeprecateServiceTask(ctx context.Context, req *model.DeprecateServiceTaskRequest) (*model.DeprecateServiceTaskResponse, error) {
    //TODO: implement Shar:DeprecateServiceTask
    panic("implement Shar:DeprecateServiceTask")
}
// GetTaskSpecVersions - The GetTaskSpecVersions method.
func (a SharAPI) GetTaskSpecVersions(ctx context.Context, req *model.GetTaskSpecVersionsRequest) (*model.GetTaskSpecVersionsResponse, error) {
    //TODO: implement Shar:GetTaskSpecVersions
    panic("implement Shar:GetTaskSpecVersions")
}
// GetTaskSpecUsage - The GetTaskSpecUsage method.
func (a SharAPI) GetTaskSpecUsage(ctx context.Context, req *model.GetTaskSpecUsageRequest) (*model.GetTaskSpecUsageResponse, error) {
    //TODO: implement Shar:GetTaskSpecUsage
    panic("implement Shar:GetTaskSpecUsage")
}
// ListTaskSpecUIDs - The ListTaskSpecUIDs method.
func (a SharAPI) ListTaskSpecUIDs(ctx context.Context, req *model.ListTaskSpecUIDsRequest) (*model.ListTaskSpecUIDsResponse, error) {
    //TODO: implement Shar:ListTaskSpecUIDs
    panic("implement Shar:ListTaskSpecUIDs")
}
// Heartbeat - The Heartbeat method.
func (a SharAPI) Heartbeat(ctx context.Context, req *model.HeartbeatRequest) (*model.HeartbeatResponse, error) {
    //TODO: implement Shar:Heartbeat
    panic("implement Shar:Heartbeat")
}
// Log - The Log method.
func (a SharAPI) Log(ctx context.Context, req *model.LogRequest) (*model.LogResponse, error) {
    //TODO: implement Shar:Log
    panic("implement Shar:Log")
}
// GetJob - The GetJob method.
func (a SharAPI) GetJob(ctx context.Context, req *model.GetJobRequest) (*model.GetJobResponse, error) {
    //TODO: implement Shar:GetJob
    panic("implement Shar:GetJob")
}

func main() {
    con, err := nats.Connect("nats://127.0.0.1:4222")
    if err != nil {
        panic(err)
    }
    ag := SharAPI{}
    api := natsrpc.NewSharServer(ag, true)
    if err := api.Listen(con,nil,nil); err != nil {
		panic(err)
    }
	select {}
}