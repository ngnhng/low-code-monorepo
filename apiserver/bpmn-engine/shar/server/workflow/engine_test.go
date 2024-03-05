package workflow

import (
	"context"
	"github.com/segmentio/ksuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"gitlab.com/shar-workflow/shar/common"
	"gitlab.com/shar-workflow/shar/common/ctxkey"
	"gitlab.com/shar-workflow/shar/common/element"
	"gitlab.com/shar-workflow/shar/common/telemetry"
	"gitlab.com/shar-workflow/shar/model"
	"gitlab.com/shar-workflow/shar/server/vars"
	"go.opentelemetry.io/otel"
	"testing"
	"time"
)

func TestLaunchWorkflow(t *testing.T) {
	ctx := context.Background()

	workflowName := "TestWorkflow"
	tp := otel.GetTracerProvider()
	eng, svc, wf := setupTestWorkflow(t, "simple-workflow.bpmn", workflowName, tp)

	processName := "SimpleProcess"
	process := wf.Process[processName]
	els := make(map[string]*model.Element)
	common.IndexProcessElements(process.Elements, els)

	svc.On("GetWorkflowNameFor", mock.AnythingOfType("*context.valueCtx"), processName).
		Return(workflowName, nil)

	svc.On("RecordHistoryProcessStart", mock.AnythingOfType("*context.valueCtx"), mock.AnythingOfType("*model.WorkflowState")).
		Return(nil)

	svc.On("CheckProcessTaskDeprecation", mock.AnythingOfType("*context.valueCtx"), mock.AnythingOfType("*model.Workflow"), "SimpleProcess").
		Return(nil)

	svc.On("GetLatestVersion", mock.AnythingOfType("*context.valueCtx"), mock.AnythingOfType("string")).
		Once().
		Return("test-workflow-id", nil)

	svc.On("GetWorkflow", mock.AnythingOfType("*context.valueCtx"), "test-workflow-id").
		Once().
		Return(wf, nil)

	executionId := "test-execution-id"

	svc.On("CreateExecution", mock.AnythingOfType("*context.valueCtx"), mock.AnythingOfType("*model.Execution")).
		Once().
		Return(&model.Execution{
			ExecutionId:  executionId,
			WorkflowId:   "test-workflow-id",
			WorkflowName: workflowName,
		}, nil)

	svc.On("CreateProcessInstance", mock.AnythingOfType("*context.valueCtx"), executionId, "", "", processName, workflowName, "test-workflow-id").
		Once().
		Return(&model.ProcessInstance{
			ProcessInstanceId: "test-process-instance-id",
			ExecutionId:       executionId,
			ParentProcessId:   nil,
			ParentElementId:   nil,
			WorkflowId:        "test-workflow-id",
			WorkflowName:      workflowName,
			ProcessName:       "TestProcess",
		}, nil)

	svc.On("PublishWorkflowState", mock.AnythingOfType("*context.valueCtx"), "WORKFLOW.%s.State.Traversal.Execute", mock.AnythingOfType("*model.WorkflowState")).
		Once().
		Run(func(args mock.Arguments) {
			assert.Equal(t, args[2].(*model.WorkflowState).WorkflowId, "test-workflow-id")
			assert.Equal(t, args[2].(*model.WorkflowState).ExecutionId, executionId)
			assert.Equal(t, args[2].(*model.WorkflowState).ElementId, "StartEvent")
			assert.Equal(t, args[2].(*model.WorkflowState).ElementType, "startEvent")
		}).
		Return(nil)

	svc.On("PublishWorkflowState", mock.AnythingOfType("*context.valueCtx"), "WORKFLOW.default.State.Process.Execute", mock.AnythingOfType("*model.WorkflowState")).
		Once().
		Run(func(args mock.Arguments) {
			assert.Equal(t, args[2].(*model.WorkflowState).WorkflowId, "test-workflow-id")
			assert.Equal(t, args[2].(*model.WorkflowState).ExecutionId, executionId)
		}).
		Return(nil)

	svc.On("PublishWorkflowState", mock.AnythingOfType("*context.valueCtx"), "WORKFLOW.%s.State.Execution.Execute", mock.AnythingOfType("*model.WorkflowState")).
		Once().
		Run(func(args mock.Arguments) {
			assert.Equal(t, args[2].(*model.WorkflowState).WorkflowId, "test-workflow-id")
			assert.Equal(t, args[2].(*model.WorkflowState).ExecutionId, executionId)
		}).
		Return(nil)
	ctx, sp1 := otel.GetTracerProvider().Tracer("shar").Start(ctx, "test-client-span")
	defer sp1.End()
	ctx = context.WithValue(ctx, ctxkey.Traceparent, telemetry.NewTraceParent(sp1.SpanContext().TraceID(), sp1.SpanContext().SpanID()))
	ctx, sp := telemetry.StartApiSpan(ctx, "shar", "test-api-call")
	defer sp.End()
	wfiid, _, err := eng.Launch(ctx, processName, []byte{})
	assert.NoError(t, err)
	assert.Equal(t, executionId, wfiid)
	svc.AssertExpectations(t)

}

func TestTraversal(t *testing.T) {
	ctx := context.Background()
	tp := otel.GetTracerProvider()
	eng, svc, wf := setupTestWorkflow(t, "simple-workflow.bpmn", "TestWorkflow", tp)

	process := wf.Process["SimpleProcess"]
	els := make(map[string]*model.Element)
	common.IndexProcessElements(process.Elements, els)

	//wfi := &model.Execution{
	//	WorkflowInstanceId: "test-workflow-instance-id",
	//	ParentElementId:    nil,
	//	WorkflowId:         "test-workflow-id",
	//	WorkflowName:       "TestWorkflow",
	//}

	currentState := &model.WorkflowState{
		WorkflowId:        "test-workflow-id",
		ElementId:         "StartEvent",
		ElementType:       element.StartEvent,
		Id:                common.TrackingID{"test-id"},
		State:             model.CancellationState_executing,
		UnixTimeNano:      time.Now().UnixNano(),
		WorkflowName:      "TestWorkflow",
		ProcessName:       "TestProcess",
		ProcessInstanceId: "test-process-instance-id",
	}

	pi := &model.ProcessInstance{
		ProcessInstanceId: "test-process-instance-id",
		ExecutionId:       "test-execution-id",
		WorkflowId:        "test-workflow-id",
		WorkflowName:      "TestWorkflow",
		ProcessName:       "TestProcess",
	}

	svc.On("PublishWorkflowState", mock.AnythingOfType("*context.valueCtx"), "WORKFLOW.%s.State.Traversal.Execute", mock.AnythingOfType("*model.WorkflowState")).
		Once().
		Run(func(args mock.Arguments) {
			assert.Equal(t, args[2].(*model.WorkflowState).WorkflowId, "test-workflow-id")
			assert.Equal(t, args[2].(*model.WorkflowState).ElementId, "Step1")
			assert.Equal(t, args[2].(*model.WorkflowState).ElementType, element.ServiceTask)
			assert.NotEmpty(t, args[2].(*model.WorkflowState).Id)
		}).
		Return(nil)

	err := eng.traverse(ctx, pi, []string{ksuid.New().String()}, els["StartEvent"].Outbound, els, currentState)
	assert.NoError(t, err)
	svc.AssertExpectations(t)

}

func TestActivityProcessorServiceTask(t *testing.T) {
	ctx := context.Background()
	tp := otel.GetTracerProvider()
	eng, svc, wf := setupTestWorkflow(t, "simple-workflow.bpmn", "TestWorkflow", tp)

	process := wf.Process["SimpleProcess"]
	els := make(map[string]*model.Element)
	common.IndexProcessElements(process.Elements, els)
	id := "ljksdadlksajkldkjsakl"

	svc.On("RecordHistoryActivityExecute", mock.AnythingOfType("*context.valueCtx"), mock.AnythingOfType("*model.WorkflowState")).
		Return(nil)

	svc.On("GetTaskSpecUID", mock.AnythingOfType("*context.valueCtx"), mock.AnythingOfType("string")).
		Return(id, nil)

	svc.On("GetProcessInstance", mock.AnythingOfType("*context.valueCtx"), "test-process-instance-id").
		Once().
		Return(&model.ProcessInstance{
			ProcessInstanceId: "test-process-instance-id",
			ExecutionId:       "test-execution-id",
			ParentProcessId:   nil,
			ParentElementId:   nil,
			WorkflowId:        "test-workflow-id",
			WorkflowName:      "TestWorkflow",
			ProcessName:       "TestProcess",
		}, nil)

	svc.On("GetWorkflow", mock.AnythingOfType("*context.valueCtx"), "test-workflow-id").
		Once().
		Return(wf, nil)

	svc.On("PublishWorkflowState", mock.AnythingOfType("*context.valueCtx"), "WORKFLOW.%s.State.Activity.Execute", mock.AnythingOfType("*model.WorkflowState")).
		Once().
		Run(func(args mock.Arguments) {
			assert.Equal(t, args[2].(*model.WorkflowState).ElementId, "Step1")
			assert.Equal(t, args[2].(*model.WorkflowState).ElementType, element.ServiceTask)
		}).
		Return(nil)

	svc.On("PublishWorkflowState", mock.AnythingOfType("*context.valueCtx"), "WORKFLOW.%s.State.Traversal.Complete", mock.AnythingOfType("*model.WorkflowState")).
		Once().
		Run(func(args mock.Arguments) {
			assert.Equal(t, args[2].(*model.WorkflowState).WorkflowId, "test-workflow-id")
			assert.Equal(t, args[2].(*model.WorkflowState).ElementId, "Step1")
			assert.Equal(t, args[2].(*model.WorkflowState).ElementType, element.ServiceTask)
			assert.NotEmpty(t, args[2].(*model.WorkflowState).Id)
		}).
		Return(nil)

	svc.On("CreateJob", mock.AnythingOfType("*context.valueCtx"), mock.AnythingOfType("*model.WorkflowState")).
		Once().
		Run(func(args mock.Arguments) {
			assert.Equal(t, args[1].(*model.WorkflowState).WorkflowId, "test-workflow-id")
			assert.Equal(t, args[1].(*model.WorkflowState).ElementId, "Step1")
			assert.Equal(t, args[1].(*model.WorkflowState).ElementType, element.ServiceTask)
		}).
		Return("test-job-id", nil)

	svc.On("PublishWorkflowState", mock.AnythingOfType("*context.valueCtx"), "WORKFLOW.default.State.Job.Execute.ServiceTask."+id, mock.AnythingOfType("*model.WorkflowState")).
		Once().
		Run(func(args mock.Arguments) {
			assert.Equal(t, args[2].(*model.WorkflowState).WorkflowId, "test-workflow-id")
			assert.Equal(t, args[2].(*model.WorkflowState).ElementId, "Step1")
			assert.Equal(t, args[2].(*model.WorkflowState).ElementType, element.ServiceTask)
			//assert.NotEmpty(t, args[2].(*model.WorkflowState).TrackingId)
		}).
		Return(nil)
	trackingID := ksuid.New().String()
	v, err := vars.Encode(context.Background(), model.Vars{})
	require.NoError(t, err)
	err = eng.activityStartProcessor(ctx, "", &model.WorkflowState{
		ElementId:         els["Step1"].Id,
		ElementType:       els["Step1"].Type,
		Id:                []string{trackingID},
		Vars:              v,
		WorkflowName:      "TestWorkflow",
		ProcessInstanceId: "test-process-instance-id",
		WorkflowId:        "test-workflow-id",
	}, false)
	assert.NoError(t, err)
	svc.AssertExpectations(t)

}

//TODO: RE-instate this test
/*
func TestCompleteJobProcessor(t *testing.T) {
	ctx := context.Background()

	_, eng, svc, wf := setupTestWorkflow(t, "simple-workflow.bpmn")

	process := wf.Process["WorkflowDemo"]
	els := make(map[string]*model.Element)
	common.IndexProcessElements(process.Elements, els)

	trackingID := ksuid.New().String()
	svc.On("GetJob", mock.AnythingOfType("*context.emptyCtx"), "test-job-id").
		Once().
		Return(&model.WorkflowState{
			WorkflowId:         "test-workflow-id",
			WorkflowInstanceId: "test-workflow-instance-id",
			ElementId:          "Step1",
			ElementType:        element.ServiceTask,
			Id:                 []string{trackingID},
			Execute:            nil,
			State:              model.CancellationState_executing,
			Condition:          nil,
			UnixTimeNano:       0,
			Vars:               []byte{},
		}, nil)

	svc.On("GetExecution", mock.AnythingOfType("*context.emptyCtx"), "test-workflow-instance-id").
		Once().
		Return(&model.Execution{
			WorkflowInstanceId:       "test-workflow-instance-id",
			ParentWorkflowInstanceId: nil,
			ParentElementId:          nil,
			WorkflowId:               "test-workflow-id",
		}, nil)

	svc.On("GetWorkflow", mock.AnythingOfType("*context.emptyCtx"), "test-workflow-id").
		Once().
		Return(wf, nil)

	svc.On("PublishWorkflowState", mock.AnythingOfType("*context.emptyCtx"), "WORKFLOW.%s.State.Traversal.Execute", mock.AnythingOfType("*model.WorkflowState"), 0).
		Once().
		Run(func(args mock.Arguments) {
			assert.Equal(t, "test-workflow-id", args[2].(*model.WorkflowState).WorkflowId)
			assert.Equal(t, "test-workflow-instance-id", args[2].(*model.WorkflowState).WorkflowInstanceId)
			assert.Equal(t, "EndEvent", args[2].(*model.WorkflowState).ElementId)
			assert.Equal(t, "endEvent", args[2].(*model.WorkflowState).ElementType)
			assert.NotEmpty(t, args[2].(*model.WorkflowState).Id)
		}).
		Return(nil)

	err := eng.completeJobProcessor(ctx, []string{"test-job-id"}, []byte{})
	assert.NoError(t, err)
	svc.AssertExpectations(t)
}
*/
