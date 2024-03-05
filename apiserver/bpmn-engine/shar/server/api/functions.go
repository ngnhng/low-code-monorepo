package api

import (
	"context"
	"errors"
	"fmt"
	"github.com/hashicorp/go-version"
	"github.com/nats-io/nats.go"
	"gitlab.com/shar-workflow/shar/common"
	"gitlab.com/shar-workflow/shar/common/ctxkey"
	"gitlab.com/shar-workflow/shar/common/logx"
	"gitlab.com/shar-workflow/shar/common/setup/upgrader"
	"gitlab.com/shar-workflow/shar/common/subj"
	"gitlab.com/shar-workflow/shar/common/validation"
	version2 "gitlab.com/shar-workflow/shar/common/version"
	"gitlab.com/shar-workflow/shar/model"
	errors2 "gitlab.com/shar-workflow/shar/server/errors"
	"gitlab.com/shar-workflow/shar/server/messages"
	"gitlab.com/shar-workflow/shar/server/vars"
)

func (s *SharServer) getProcessInstanceStatus(ctx context.Context, req *model.GetProcessInstanceStatusRequest) (*model.GetProcessInstanceStatusResult, error) {
	ps, err := s.ns.GetProcessInstanceStatus(ctx, req.Id)
	if err != nil {
		return nil, fmt.Errorf("getProcessInstanceStatus failed with: %w", err)
	}
	return &model.GetProcessInstanceStatusResult{ProcessState: ps}, nil
}

func (s *SharServer) listExecutionProcesses(ctx context.Context, req *model.ListExecutionProcessesRequest) (*model.ListExecutionProcessesResponse, error) {
	ctx, instance, err2 := s.authFromExecutionID(ctx, req.Id)
	if err2 != nil {
		return nil, fmt.Errorf("authorize %v: %w", ctx.Value(ctxkey.APIFunc), err2)
	}
	res, err := s.ns.ListExecutionProcesses(ctx, instance.ExecutionId)
	if err != nil {
		return nil, fmt.Errorf("get execution status: %w", err)
	}
	return &model.ListExecutionProcessesResponse{ProcessInstanceId: res}, nil
}

func (s *SharServer) listWorkflows(ctx context.Context, _ *model.ListWorkflowsRequest) (*model.ListWorkflowsResponse, error) {
	ctx, err2 := s.authForNonWorkflow(ctx)
	if err2 != nil {
		return nil, fmt.Errorf("authorize %v: %w", ctx.Value(ctxkey.APIFunc), err2)
	}
	res, errs := s.ns.ListWorkflows(ctx)
	ret := make([]*model.ListWorkflowResponse, 0)
	for {
		select {
		case winf := <-res:
			if winf == nil {
				return &model.ListWorkflowsResponse{Result: ret}, nil
			}
			ret = append(ret, &model.ListWorkflowResponse{
				Name:    winf.Name,
				Version: winf.Version,
			})
		case err := <-errs:
			return nil, fmt.Errorf("list workflowsr: %w", err)
		}
	}
}

func (s *SharServer) sendMessage(ctx context.Context, req *model.SendMessageRequest) (*model.SendMessageResponse, error) {
	//TODO: how do we auth this?

	messageName := req.Name
	if req.CorrelationKey == "\"\"" {
		if processId, err := s.ns.GetProcessIdFor(ctx, messageName); err != nil {
			return nil, fmt.Errorf("error retrieving process id for message name: %w", err)
		} else {
			launchWorkflowRequest := &model.LaunchWorkflowRequest{
				Name: processId,
				Vars: req.Vars,
			}
			launchWorkflowResponse, err := s.launchProcess(ctx, launchWorkflowRequest)
			if err != nil {
				return nil, fmt.Errorf("failed to launch process with message: %w", err)
			}
			executionId := launchWorkflowResponse.InstanceId
			workflowId := launchWorkflowResponse.WorkflowId
			return &model.SendMessageResponse{ExecutionId: executionId, WorkflowId: workflowId}, nil
		}
	} else {
		if err := s.ns.PublishMessage(ctx, messageName, req.CorrelationKey, req.Vars); err != nil {
			return nil, fmt.Errorf("send message: %w", err)
		}
	}
	return &model.SendMessageResponse{}, nil
}

func (s *SharServer) completeManualTask(ctx context.Context, req *model.CompleteManualTaskRequest) (*model.CompleteManualTaskResponse, error) {
	ctx, job, err2 := s.authFromJobID(ctx, req.TrackingId)
	if err2 != nil {
		return nil, fmt.Errorf("authorize %v: %w", ctx.Value(ctxkey.APIFunc), err2)
	}
	if err := s.engine.CompleteManualTask(ctx, job, req.Vars); err != nil {
		return nil, fmt.Errorf("complete manual task: %w", err)
	}
	return nil, nil
}

func (s *SharServer) completeServiceTask(ctx context.Context, req *model.CompleteServiceTaskRequest) (*model.CompleteServiceTaskResponse, error) {
	ctx, job, err2 := s.authFromJobID(ctx, req.TrackingId)
	if err2 != nil {
		return nil, fmt.Errorf("authorize %v: %w", ctx.Value(ctxkey.APIFunc), err2)
	}
	if err := s.engine.CompleteServiceTask(ctx, job, req.Vars); err != nil {
		return nil, fmt.Errorf("complete service task: %w", err)
	}
	return nil, nil
}

func (s *SharServer) completeSendMessageTask(ctx context.Context, req *model.CompleteSendMessageRequest) (*model.CompleteSendMessageResponse, error) {
	ctx, job, err2 := s.authFromJobID(ctx, req.TrackingId)
	if err2 != nil {
		return nil, fmt.Errorf("authorize %v: %w", ctx.Value(ctxkey.APIFunc), err2)
	}
	if err := s.engine.CompleteSendMessageTask(ctx, job, req.Vars); err != nil {
		return nil, fmt.Errorf("complete send message task: %w", err)
	}
	return nil, nil
}

func (s *SharServer) completeUserTask(ctx context.Context, req *model.CompleteUserTaskRequest) (*model.CompleteUserTaskResponse, error) {
	ctx, job, err2 := s.authFromJobID(ctx, req.TrackingId)
	if err2 != nil {
		return nil, fmt.Errorf("authorize complete user task: %w", err2)
	}
	if err := s.engine.CompleteUserTask(ctx, job, req.Vars); err != nil {
		return nil, fmt.Errorf("complete user task: %w", err)
	}
	return nil, nil
}

func (s *SharServer) storeWorkflow(ctx context.Context, wf *model.StoreWorkflowRequest) (*model.StoreWorkflowResponse, error) {
	ctx, err2 := s.authForNamedWorkflow(ctx, wf.Workflow.Name)
	if err2 != nil {
		return nil, fmt.Errorf("authorize complete user task: %w", err2)
	}
	res, err := s.engine.LoadWorkflow(ctx, wf.Workflow)
	if err != nil {
		return nil, fmt.Errorf("store workflow: %w", err)
	}
	return &model.StoreWorkflowResponse{WorkflowId: res}, nil
}

func (s *SharServer) launchProcess(ctx context.Context, req *model.LaunchWorkflowRequest) (*model.LaunchWorkflowResponse, error) {
	ctx, err2 := s.authForNamedWorkflow(ctx, req.Name)
	if err2 != nil {
		return nil, fmt.Errorf("authorize complete user task: %w", err2)
	}
	executionID, wfID, err := s.engine.Launch(ctx, req.Name, req.Vars)
	if err != nil {
		return nil, fmt.Errorf("launch execution kv: %w", err)
	}
	return &model.LaunchWorkflowResponse{WorkflowId: wfID, InstanceId: executionID}, nil
}

func (s *SharServer) cancelProcessInstance(ctx context.Context, req *model.CancelProcessInstanceRequest) (*model.CancelProcessInstanceResponse, error) {
	ctx, instance, err2 := s.authFromProcessInstanceID(ctx, req.Id)
	if err2 != nil {
		return nil, fmt.Errorf("authorize %v: %w", ctx.Value(ctxkey.APIFunc), err2)
	}
	// TODO: get working state here
	state := &model.WorkflowState{
		ProcessInstanceId: instance.ProcessInstanceId,
		State:             req.State,
		Error:             req.Error,
	}
	err := s.engine.CancelProcessInstance(ctx, state)
	if err != nil {
		return nil, fmt.Errorf("cancel execution kv: %w", err)
	}
	return &model.CancelProcessInstanceResponse{}, nil
}

func (s *SharServer) listExecution(ctx context.Context, req *model.ListExecutionRequest) (*model.ListExecutionResponse, error) {
	ctx, err2 := s.authForNamedWorkflow(ctx, req.WorkflowName)
	if err2 != nil {
		return nil, fmt.Errorf("authorize complete user task: %w", err2)
	}
	wch, errs := s.ns.ListExecutions(ctx, req.WorkflowName)
	ret := make([]*model.ListExecutionItem, 0)
	for {
		select {
		case winf := <-wch:
			if winf == nil {
				return &model.ListExecutionResponse{Result: ret}, nil
			}
			ret = append(ret, &model.ListExecutionItem{
				Id:      winf.Id,
				Version: winf.Version,
			})
		case err := <-errs:
			return nil, fmt.Errorf("list executions: %w", err)
		}
	}
}

func (s *SharServer) handleWorkflowError(ctx context.Context, req *model.HandleWorkflowErrorRequest) (*model.HandleWorkflowErrorResponse, error) {
	ctx, job, err2 := s.authFromJobID(ctx, req.TrackingId)
	if err2 != nil {
		return nil, fmt.Errorf("authorize %v: %w", ctx.Value(ctxkey.APIFunc), err2)
	}
	// Sanity check
	if req.ErrorCode == "" {
		return nil, fmt.Errorf("ErrorCode may not be empty: %w", errors2.ErrMissingErrorCode)
	}

	// Get the workflow, so we can look up the error definitions
	wf, err := s.ns.GetWorkflow(ctx, job.WorkflowId)
	if err != nil {
		return nil, fmt.Errorf("get workflow definition for handle workflow error: %w", err)
	}

	// Get the element corresponding to the job
	els := common.ElementTable(wf)

	// Get the current element
	el := els[job.ElementId]

	// Get the errors supported by this workflow
	var found bool
	wfErrs := make(map[string]*model.Error)
	for _, v := range wf.Errors {
		if v.Code == req.ErrorCode {
			found = true
		}
		wfErrs[v.Id] = v
	}
	if !found {
		werr := &errors2.ErrWorkflowFatal{Err: fmt.Errorf("workflow-fatal: can't handle error code %s as the workflow doesn't support it: %w", req.ErrorCode, errors2.ErrWorkflowErrorNotFound)}
		// TODO: This always assumes service task.  Wrong!
		if err := s.ns.PublishWorkflowState(ctx, subj.NS(messages.WorkflowJobServiceTaskAbort, subj.GetNS(ctx)), job); err != nil {
			return nil, fmt.Errorf("cencel job: %w", werr)
		}

		cancelState := common.CopyWorkflowState(job)
		cancelState.State = model.CancellationState_errored
		cancelState.Error = &model.Error{
			Id:   "UNKNOWN",
			Name: "UNKNOWN",
			Code: req.ErrorCode,
		}
		if err := s.engine.CancelProcessInstance(ctx, cancelState); err != nil {
			return nil, fmt.Errorf("cancel workflow instance: %w", werr)
		}
		return nil, fmt.Errorf("workflow halted: %w", werr)
	}

	// Get the errors associated with this element
	var errDef *model.Error
	var caughtError *model.CatchError
	for _, v := range el.Errors {
		wfErr := wfErrs[v.ErrorId]
		if req.ErrorCode == wfErr.Code {
			errDef = wfErr
			caughtError = v
			break
		}
	}

	if errDef == nil {
		return &model.HandleWorkflowErrorResponse{Handled: false}, nil
	}

	// Get the target workflow activity
	target := els[caughtError.Target]

	oldState, err := s.ns.GetOldState(ctx, common.TrackingID(job.Id).Pop().ID())
	if err != nil {
		return nil, fmt.Errorf("get old state for handle workflow error: %w", err)
	}
	if err := vars.OutputVars(ctx, req.Vars, &oldState.Vars, caughtError.OutputTransform); err != nil {
		return nil, &errors2.ErrWorkflowFatal{Err: err}
	}
	if err := s.ns.PublishWorkflowState(ctx, messages.WorkflowTraversalExecute, &model.WorkflowState{
		ElementType: target.Type,
		ElementId:   target.Id,
		WorkflowId:  job.WorkflowId,
		//WorkflowInstanceId: job.WorkflowInstanceId,
		ExecutionId:       job.ExecutionId,
		Id:                common.TrackingID(job.Id).Pop().Pop(),
		Vars:              oldState.Vars,
		WorkflowName:      wf.Name,
		ProcessInstanceId: job.ProcessInstanceId,
		ProcessName:       job.ProcessName,
	}); err != nil {
		log := logx.FromContext(ctx)
		log.Error("publish workflow state", err)
		return nil, fmt.Errorf("publish traversal for handle workflow error: %w", err)
	}
	// TODO: This always assumes service task.  Wrong!
	if err := s.ns.PublishWorkflowState(ctx, messages.WorkflowJobServiceTaskAbort, &model.WorkflowState{
		ElementType: target.Type,
		ElementId:   target.Id,
		WorkflowId:  job.WorkflowId,
		//WorkflowInstanceId: job.WorkflowInstanceId,
		ExecutionId:       job.ExecutionId,
		Id:                job.Id,
		Vars:              job.Vars,
		WorkflowName:      wf.Name,
		ProcessInstanceId: job.ProcessInstanceId,
		ProcessName:       job.ProcessName,
	}); err != nil {
		log := logx.FromContext(ctx)
		log.Error("publish workflow state", err)
		// We have already traversed so retunring an error here would be incorrect.
		// It would force reprocessing and possibly double traversing
		// TODO: develop an idempotent behaviour based upon hash nats message ids + deduplication
		return nil, fmt.Errorf("publish abort task for handle workflow error: %w", err)
	}
	return &model.HandleWorkflowErrorResponse{Handled: true}, nil
}

func (s *SharServer) listUserTaskIDs(ctx context.Context, req *model.ListUserTasksRequest) (*model.UserTasks, error) {
	ctx, err2 := s.authForNonWorkflow(ctx)
	if err2 != nil {
		return nil, fmt.Errorf("authorize %v: %w", ctx.Value(ctxkey.APIFunc), err2)
	}
	oid, err := s.ns.OwnerID(ctx, req.Owner)
	if err != nil {
		return nil, fmt.Errorf("get owner ID: %w", err)
	}
	ut, err := s.ns.GetUserTaskIDs(ctx, oid)
	if errors.Is(err, nats.ErrKeyNotFound) {
		return &model.UserTasks{Id: []string{}}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get user task IDs: %w", err)
	}
	return ut, nil
}

func (s *SharServer) getUserTask(ctx context.Context, req *model.GetUserTaskRequest) (*model.GetUserTaskResponse, error) {
	ctx, job, err2 := s.authFromJobID(ctx, req.TrackingId)
	if err2 != nil {
		return nil, fmt.Errorf("authorize %v: %w", ctx.Value(ctxkey.APIFunc), err2)
	}
	wf, err := s.ns.GetWorkflow(ctx, job.WorkflowId)
	if err != nil {
		return nil, fmt.Errorf("get user task failed to get workflow: %w", err)
	}
	els := make(map[string]*model.Element)
	for _, v := range wf.Process {
		common.IndexProcessElements(v.Elements, els)
	}
	return &model.GetUserTaskResponse{
		TrackingId:  common.TrackingID(job.Id).ID(),
		Owner:       req.Owner,
		Name:        els[job.ElementId].Name,
		Description: els[job.ElementId].Documentation,
		Vars:        job.Vars,
	}, nil
}

func (s *SharServer) getJob(ctx context.Context, req *model.GetJobRequest) (*model.GetJobResponse, error) {
	ctx, job, err2 := s.authFromJobID(ctx, req.JobId)
	if err2 != nil {
		return nil, fmt.Errorf("authorize %v: %w", ctx.Value(ctxkey.APIFunc), err2)
	}
	return &model.GetJobResponse{
		Job: job,
	}, nil
}

func (s *SharServer) getWorkflowVersions(ctx context.Context, req *model.GetWorkflowVersionsRequest) (*model.GetWorkflowVersionsResponse, error) {
	ctx, err2 := s.authForNamedWorkflow(ctx, req.Name)
	if err2 != nil {
		return nil, fmt.Errorf("authorize %v: %w", ctx.Value(ctxkey.APIFunc), err2)
	}
	ret, err := s.ns.GetWorkflowVersions(ctx, req.Name)
	if err != nil {
		return nil, fmt.Errorf("get workflow versions: %w", err)
	}
	return &model.GetWorkflowVersionsResponse{Versions: ret}, nil
}

func (s *SharServer) getWorkflow(ctx context.Context, req *model.GetWorkflowRequest) (*model.GetWorkflowResponse, error) {
	ctx, err2 := s.authForNonWorkflow(ctx)
	if err2 != nil {
		return nil, fmt.Errorf("authorize %v: %w", ctx.Value(ctxkey.APIFunc), err2)
	}
	ret, err := s.ns.GetWorkflow(ctx, req.Id)
	if err != nil {
		return nil, fmt.Errorf("get workflow: %w", err)
	}
	return &model.GetWorkflowResponse{Definition: ret}, nil
}

func (s *SharServer) getProcessHistory(ctx context.Context, req *model.GetProcessHistoryRequest) (*model.GetProcessHistoryResponse, error) {
	ctx, _, err := s.authFromProcessInstanceID(ctx, req.Id)
	if err != nil {
		return nil, fmt.Errorf("authorize %v: %w", ctx.Value(ctxkey.APIFunc), err)
	}
	ret, err := s.ns.GetProcessHistory(ctx, req.Id)
	if err != nil {
		return nil, fmt.Errorf("get process history: %w", err)
	}
	return &model.GetProcessHistoryResponse{Entry: ret}, nil
}

func (s *SharServer) versionInfo(ctx context.Context, req *model.GetVersionInfoRequest) (*model.GetVersionInfoResponse, error) {
	ctx, _, err2 := s.authenticate(ctx)
	if err2 != nil {
		return nil, fmt.Errorf("authorize %v: %w", ctx.Value(ctxkey.APIFunc), err2)
	}

	// For clients that can't supply the compatible version
	if req.CompatibleVersion == "" {
		return nil, fmt.Errorf("client version too old, please upgrade to " + version2.Version)
	}

	v, err := version.NewVersion(req.CompatibleVersion)
	if err != nil {
		return nil, fmt.Errorf("parsing client version '%s': %w", req.ClientVersion, err)
	}
	ok, ver := upgrader.IsCompatible(v)
	ret := &model.GetVersionInfoResponse{
		ServerVersion:        version2.Version,
		MinCompatibleVersion: ver.String(),
		Connect:              ok,
	}
	if err != nil {
		return nil, fmt.Errorf("get version: %w", err)
	}
	return ret, nil
}

func (s *SharServer) registerTask(ctx context.Context, req *model.RegisterTaskRequest) (*model.RegisterTaskResponse, error) {
	ctx, err2 := s.authForNonWorkflow(ctx)
	if err2 != nil {
		return nil, fmt.Errorf("authorize %v: %w", ctx.Value(ctxkey.APIFunc), err2)
	}

	if err := validation.ValidateTaskSpec(req.Spec); err != nil {
		return nil, fmt.Errorf("validaet service task: %w", err)
	}

	uid, err := s.ns.PutTaskSpec(ctx, req.Spec)

	if err != nil {
		return nil, fmt.Errorf("register task spec: %w", err)
	}

	return &model.RegisterTaskResponse{Uid: uid}, nil
}

func (s *SharServer) deprecateServiceTask(ctx context.Context, req *model.DeprecateServiceTaskRequest) (*model.DeprecateServiceTaskResponse, error) {
	ctx, err2 := s.authForNonWorkflow(ctx)
	if err2 != nil {
		return nil, fmt.Errorf("authorize %v: %w", ctx.Value(ctxkey.APIFunc), err2)
	}

	usage, err := s.ns.GetTaskSpecUsage(ctx, []string{req.Name})
	if err != nil {
		return nil, fmt.Errorf("deprecate service task get initial task usage: %w", err)
	}

	if len(usage.ExecutingWorkflow)+len(usage.ExecutingProcessInstance) > 0 {
		return &model.DeprecateServiceTaskResponse{Usage: usage, Success: false}, nil
	}

	// Deprecate the task to ensure it can't get launched.
	err = s.ns.DeprecateTaskSpec(ctx, []string{req.Name})
	if err != nil {
		return nil, fmt.Errorf("delete service task get spec UID: %w", err)
	}
	return &model.DeprecateServiceTaskResponse{Usage: usage, Success: true}, nil
}
func (s *SharServer) getTaskSpec(ctx context.Context, req *model.GetTaskSpecRequest) (*model.GetTaskSpecResponse, error) {
	ctx, err2 := s.authForNonWorkflow(ctx)
	if err2 != nil {
		return nil, fmt.Errorf("authorize %v: %w", ctx.Value(ctxkey.APIFunc), err2)
	}

	spec, err := s.ns.GetTaskSpecByUID(ctx, req.Uid)
	if err != nil {
		return nil, fmt.Errorf("get task spec: %w", err)
	}
	return &model.GetTaskSpecResponse{Spec: spec}, nil
}

func (s *SharServer) getTaskSpecVersions(ctx context.Context, req *model.GetTaskSpecVersionsRequest) (*model.GetTaskSpecVersionsResponse, error) {
	ctx, err2 := s.authForNonWorkflow(ctx)
	if err2 != nil {
		return nil, fmt.Errorf("authorize %v: %w", ctx.Value(ctxkey.APIFunc), err2)
	}

	vers, err := s.ns.GetTaskSpecVersions(ctx, req.Name)
	if err != nil {
		return nil, fmt.Errorf("get task spec versions: %w", err)
	}
	return &model.GetTaskSpecVersionsResponse{Versions: vers}, nil
}

func (s *SharServer) getTaskSpecUsage(ctx context.Context, req *model.GetTaskSpecUsageRequest) (*model.TaskSpecUsageReport, error) {
	ctx, err2 := s.authForNonWorkflow(ctx)
	if err2 != nil {
		return nil, fmt.Errorf("authorize %v: %w", ctx.Value(ctxkey.APIFunc), err2)
	}

	usage, err := s.ns.GetTaskSpecUsage(ctx, []string{req.Id})
	if err != nil {
		return nil, fmt.Errorf("get task spec versions: %w", err)
	}
	return usage, nil
}

func (s *SharServer) listTaskSpecUIDs(ctx context.Context, req *model.ListTaskSpecUIDsRequest) (*model.ListTaskSpecUIDsResponse, error) {
	ctx, err2 := s.authForNonWorkflow(ctx)
	if err2 != nil {
		return nil, fmt.Errorf("authorize %v: %w", ctx.Value(ctxkey.APIFunc), err2)
	}

	uids, err := s.ns.ListTaskSpecUIDs(ctx, req.IncludeDeprecated)
	if err != nil {
		return nil, fmt.Errorf("list task spec uids: %w", err)
	}
	return &model.ListTaskSpecUIDsResponse{Uid: uids}, nil
}

func (s *SharServer) heartbeat(ctx context.Context, req *model.HeartbeatRequest) (*model.HeartbeatResponse, error) {
	if err := s.ns.Heartbeat(ctx, req); err != nil {
		return nil, fmt.Errorf("heartbeat: %w", err)
	}
	return &model.HeartbeatResponse{}, nil
}

func (s *SharServer) log(ctx context.Context, req *model.LogRequest) (*model.LogResponse, error) {
	if err := s.ns.Log(ctx, req); err != nil {
		return nil, fmt.Errorf("log: %w", err)
	}
	return &model.LogResponse{}, nil
}
