package main
// TODO: WARNING  - this example code will be overwritten upon generation.  Copy elsewhere to modify.
import (
	"fmt"
    "context"
    "github.com/nats-io/nats.go"
    "gitlab.com/shar-workflow/shar/model"
	"gitlab.com/shar-workflow/shar/internal/natsrpc"
)


func main() {
    con, err := nats.Connect("nats://127.0.0.1:4222")
    if err != nil {
        panic(err)
    }
    api := natsrpc.NewSharClient(con, nil, nil)
    ctx := context.Background()

    // Call StoreWorkflow
    reqStoreWorkflow := &model.StoreWorkflowRequest{}
    resStoreWorkflow, err := api.StoreWorkflow(ctx, reqStoreWorkflow)
    if err != nil {
        panic(err)
    }
    fmt.Println(resStoreWorkflow)

    // Call CancelProcessInstance
    reqCancelProcessInstance := &model.CancelProcessInstanceRequest{}
    resCancelProcessInstance, err := api.CancelProcessInstance(ctx, reqCancelProcessInstance)
    if err != nil {
        panic(err)
    }
    fmt.Println(resCancelProcessInstance)

    // Call LaunchProcess
    reqLaunchProcess := &model.LaunchWorkflowRequest{}
    resLaunchProcess, err := api.LaunchProcess(ctx, reqLaunchProcess)
    if err != nil {
        panic(err)
    }
    fmt.Println(resLaunchProcess)

    // Call ListWorkflows
    reqListWorkflows := &model.ListWorkflowsRequest{}
    resListWorkflows, err := api.ListWorkflows(ctx, reqListWorkflows)
    if err != nil {
        panic(err)
    }
    fmt.Println(resListWorkflows)

    // Call ListExecutionProcesses
    reqListExecutionProcesses := &model.ListExecutionProcessesRequest{}
    resListExecutionProcesses, err := api.ListExecutionProcesses(ctx, reqListExecutionProcesses)
    if err != nil {
        panic(err)
    }
    fmt.Println(resListExecutionProcesses)

    // Call ListExecution
    reqListExecution := &model.ListExecutionRequest{}
    resListExecution, err := api.ListExecution(ctx, reqListExecution)
    if err != nil {
        panic(err)
    }
    fmt.Println(resListExecution)

    // Call SendMessage
    reqSendMessage := &model.SendMessageRequest{}
    resSendMessage, err := api.SendMessage(ctx, reqSendMessage)
    if err != nil {
        panic(err)
    }
    fmt.Println(resSendMessage)

    // Call CompleteManualTask
    reqCompleteManualTask := &model.CompleteManualTaskRequest{}
    resCompleteManualTask, err := api.CompleteManualTask(ctx, reqCompleteManualTask)
    if err != nil {
        panic(err)
    }
    fmt.Println(resCompleteManualTask)

    // Call CompleteServiceTask
    reqCompleteServiceTask := &model.CompleteServiceTaskRequest{}
    resCompleteServiceTask, err := api.CompleteServiceTask(ctx, reqCompleteServiceTask)
    if err != nil {
        panic(err)
    }
    fmt.Println(resCompleteServiceTask)

    // Call CompleteUserTask
    reqCompleteUserTask := &model.CompleteUserTaskRequest{}
    resCompleteUserTask, err := api.CompleteUserTask(ctx, reqCompleteUserTask)
    if err != nil {
        panic(err)
    }
    fmt.Println(resCompleteUserTask)

    // Call ListUserTaskIDs
    reqListUserTaskIDs := &model.ListUserTasksRequest{}
    resListUserTaskIDs, err := api.ListUserTaskIDs(ctx, reqListUserTaskIDs)
    if err != nil {
        panic(err)
    }
    fmt.Println(resListUserTaskIDs)

    // Call GetUserTask
    reqGetUserTask := &model.GetUserTaskRequest{}
    resGetUserTask, err := api.GetUserTask(ctx, reqGetUserTask)
    if err != nil {
        panic(err)
    }
    fmt.Println(resGetUserTask)

    // Call HandleWorkflowError
    reqHandleWorkflowError := &model.HandleWorkflowErrorRequest{}
    resHandleWorkflowError, err := api.HandleWorkflowError(ctx, reqHandleWorkflowError)
    if err != nil {
        panic(err)
    }
    fmt.Println(resHandleWorkflowError)

    // Call CompleteSendMessageTask
    reqCompleteSendMessageTask := &model.CompleteSendMessageRequest{}
    resCompleteSendMessageTask, err := api.CompleteSendMessageTask(ctx, reqCompleteSendMessageTask)
    if err != nil {
        panic(err)
    }
    fmt.Println(resCompleteSendMessageTask)

    // Call GetWorkflowVersions
    reqGetWorkflowVersions := &model.GetWorkflowVersionsRequest{}
    resGetWorkflowVersions, err := api.GetWorkflowVersions(ctx, reqGetWorkflowVersions)
    if err != nil {
        panic(err)
    }
    fmt.Println(resGetWorkflowVersions)

    // Call GetWorkflow
    reqGetWorkflow := &model.GetWorkflowRequest{}
    resGetWorkflow, err := api.GetWorkflow(ctx, reqGetWorkflow)
    if err != nil {
        panic(err)
    }
    fmt.Println(resGetWorkflow)

    // Call GetProcessInstanceStatus
    reqGetProcessInstanceStatus := &model.GetProcessInstanceStatusRequest{}
    resGetProcessInstanceStatus, err := api.GetProcessInstanceStatus(ctx, reqGetProcessInstanceStatus)
    if err != nil {
        panic(err)
    }
    fmt.Println(resGetProcessInstanceStatus)

    // Call GetProcessHistory
    reqGetProcessHistory := &model.GetProcessHistoryRequest{}
    resGetProcessHistory, err := api.GetProcessHistory(ctx, reqGetProcessHistory)
    if err != nil {
        panic(err)
    }
    fmt.Println(resGetProcessHistory)

    // Call GetVersionInfo
    reqGetVersionInfo := &model.GetVersionInfoRequest{}
    resGetVersionInfo, err := api.GetVersionInfo(ctx, reqGetVersionInfo)
    if err != nil {
        panic(err)
    }
    fmt.Println(resGetVersionInfo)

    // Call RegisterTask
    reqRegisterTask := &model.RegisterTaskRequest{}
    resRegisterTask, err := api.RegisterTask(ctx, reqRegisterTask)
    if err != nil {
        panic(err)
    }
    fmt.Println(resRegisterTask)

    // Call GetTaskSpec
    reqGetTaskSpec := &model.GetTaskSpecRequest{}
    resGetTaskSpec, err := api.GetTaskSpec(ctx, reqGetTaskSpec)
    if err != nil {
        panic(err)
    }
    fmt.Println(resGetTaskSpec)

    // Call DeprecateServiceTask
    reqDeprecateServiceTask := &model.DeprecateServiceTaskRequest{}
    resDeprecateServiceTask, err := api.DeprecateServiceTask(ctx, reqDeprecateServiceTask)
    if err != nil {
        panic(err)
    }
    fmt.Println(resDeprecateServiceTask)

    // Call GetTaskSpecVersions
    reqGetTaskSpecVersions := &model.GetTaskSpecVersionsRequest{}
    resGetTaskSpecVersions, err := api.GetTaskSpecVersions(ctx, reqGetTaskSpecVersions)
    if err != nil {
        panic(err)
    }
    fmt.Println(resGetTaskSpecVersions)

    // Call GetTaskSpecUsage
    reqGetTaskSpecUsage := &model.GetTaskSpecUsageRequest{}
    resGetTaskSpecUsage, err := api.GetTaskSpecUsage(ctx, reqGetTaskSpecUsage)
    if err != nil {
        panic(err)
    }
    fmt.Println(resGetTaskSpecUsage)

    // Call ListTaskSpecUIDs
    reqListTaskSpecUIDs := &model.ListTaskSpecUIDsRequest{}
    resListTaskSpecUIDs, err := api.ListTaskSpecUIDs(ctx, reqListTaskSpecUIDs)
    if err != nil {
        panic(err)
    }
    fmt.Println(resListTaskSpecUIDs)

    // Call Heartbeat
    reqHeartbeat := &model.HeartbeatRequest{}
    resHeartbeat, err := api.Heartbeat(ctx, reqHeartbeat)
    if err != nil {
        panic(err)
    }
    fmt.Println(resHeartbeat)

    // Call Log
    reqLog := &model.LogRequest{}
    resLog, err := api.Log(ctx, reqLog)
    if err != nil {
        panic(err)
    }
    fmt.Println(resLog)

    // Call GetJob
    reqGetJob := &model.GetJobRequest{}
    resGetJob, err := api.GetJob(ctx, reqGetJob)
    if err != nil {
        panic(err)
    }
    fmt.Println(resGetJob)
}