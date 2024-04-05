package workflow

import (
	"context"
	errors2 "errors"
	"fmt"
	"github.com/nats-io/nats.go"
	"github.com/segmentio/ksuid"
	"gitlab.com/shar-workflow/shar/client/parser"
	"gitlab.com/shar-workflow/shar/common"
	"gitlab.com/shar-workflow/shar/common/ctxkey"
	"gitlab.com/shar-workflow/shar/common/element"
	"gitlab.com/shar-workflow/shar/common/expression"
	"gitlab.com/shar-workflow/shar/common/logx"
	"gitlab.com/shar-workflow/shar/common/subj"
	"gitlab.com/shar-workflow/shar/common/telemetry"
	"gitlab.com/shar-workflow/shar/common/version"
	"gitlab.com/shar-workflow/shar/model"
	"gitlab.com/shar-workflow/shar/server/errors"
	"gitlab.com/shar-workflow/shar/server/errors/keys"
	"gitlab.com/shar-workflow/shar/server/messages"
	"gitlab.com/shar-workflow/shar/server/services"
	"gitlab.com/shar-workflow/shar/server/services/storage"
	"gitlab.com/shar-workflow/shar/server/vars"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/trace"
	"google.golang.org/protobuf/proto"
	"log/slog"
	"strconv"
	"time"
)

// Engine contains the workflow processing functions
type Engine struct {
	closing chan struct{}
	ns      NatsService
	tr      trace.Tracer
}

// New returns an instance of the core workflow engine.
func New(ns NatsService) (*Engine, error) {
	e := &Engine{
		ns:      ns,
		closing: make(chan struct{}),
		tr:      otel.GetTracerProvider().Tracer("shar", trace.WithInstrumentationVersion(version.Version)),
	}
	return e, nil
}

// Start sets up the activity and job processors and starts the engine processing workflows.
func (c *Engine) Start(ctx context.Context) error {
	// Start the workflow event processor.  This processes all the workflow states.
	c.ns.SetEventProcessor(c.activityStartProcessor)

	// Start the competed job processor.  This processes any tasks completed by the client.
	c.ns.SetCompleteJobProcessor(c.completeJobProcessor)

	// Set traversal function
	c.ns.SetTraversalProvider(c.traverse)

	// Set the completed activity processor
	c.ns.SetCompleteActivityProcessor(c.activityCompleteProcessor)

	// Set the completed activity processor
	c.ns.SetCompleteActivity(c.completeActivity)

	c.ns.SetMessageProcessor(c.timedExecuteProcessor)

	c.ns.SetLaunchFunc(c.launchProcessor)

	c.ns.SetAbort(c.abortProcessor)

	if err := c.ns.StartProcessing(ctx); err != nil {
		return fmt.Errorf("start processing: %w", err)
	}
	return nil
}

// LoadWorkflow loads a model.Process describing a workflow into the engine ready for execution.
func (c *Engine) LoadWorkflow(ctx context.Context, model *model.Workflow) (string, error) {
	// Store the workflow model and return an ID
	wfID, err := c.ns.StoreWorkflow(ctx, model)
	if err != nil {
		return "", fmt.Errorf("store workflow: %w", err)
	}
	return wfID, nil
}

// Launch starts a new instance of a workflow and returns an execution Id.
func (c *Engine) Launch(ctx context.Context, processName string, vars []byte) (string, string, error) {
	return c.launch(ctx, processName, []string{}, vars, "", "")
}

// launch contains the underlying logic to start a workflow.  It is also called to spawn new instances of child workflows.
func (c *Engine) launch(ctx context.Context, processName string, ID common.TrackingID, vrs []byte, parentpiID string, parentElID string) (string, string, error) {
	var reterr error
	ctx, log := logx.ContextWith(ctx, "engine.launch")

	workflowName, err := c.ns.GetWorkflowNameFor(ctx, processName)
	if err != nil {
		reterr = c.engineErr(ctx, "get the workflow name for this process name", err,
			slog.String(keys.ParentInstanceElementID, parentElID),
			slog.String(keys.ParentProcessInstanceID, parentpiID),
			slog.String(keys.ProcessName, processName),
		)
		return "", "", reterr
	}

	// get the last ID of the workflow
	wfID, err := c.ns.GetLatestVersion(ctx, workflowName)
	if err != nil {
		reterr = c.engineErr(ctx, "get latest version of workflow", err,
			slog.String(keys.ParentInstanceElementID, parentElID),
			slog.String(keys.ParentProcessInstanceID, parentpiID),
			slog.String(keys.WorkflowName, workflowName),
		)
		return "", "", reterr
	}

	// get the last version of the workflow
	wf, err := c.ns.GetWorkflow(ctx, wfID)

	if err != nil {
		reterr = c.engineErr(ctx, "get workflow", err,
			slog.String(keys.ParentInstanceElementID, parentElID),
			slog.String(keys.ParentProcessInstanceID, parentpiID),
			slog.String(keys.WorkflowName, workflowName),
			slog.String(keys.WorkflowID, wfID),
		)
		return "", "", reterr
	}

	if err := c.ns.CheckProcessTaskDeprecation(ctx, wf, processName); err != nil {
		return "", "", fmt.Errorf("check task deprecation: %w", err)
	}

	var executionId string

	if parentpiID == "" {
		e, err := c.ns.CreateExecution(ctx, &model.Execution{
			WorkflowId:   wfID,
			WorkflowName: wf.Name,
		})

		if err != nil {
			reterr = c.engineErr(ctx, "create execution", err,
				slog.String(keys.ParentInstanceElementID, parentElID),
				slog.String(keys.ParentProcessInstanceID, parentpiID),
				slog.String(keys.WorkflowName, workflowName),
				slog.String(keys.WorkflowID, wfID),
			)
			return "", "", reterr
		}

		defer func() {
			if reterr != nil {
				c.rollBackLaunch(ctx, e)
			}
		}()
		executionId = e.ExecutionId
	} else {
		pi, err := c.ns.GetProcessInstance(ctx, parentpiID)
		if err != nil {
			reterr = fmt.Errorf("launch failed to get process instance for parent: %w", err)
			return "", "", reterr
		}

		e, err := c.ns.GetExecution(ctx, pi.ExecutionId)
		if err != nil {
			reterr = fmt.Errorf("launch failed to get execution for parent: %w", err)
			return "", "", reterr
		}

		executionId = e.ExecutionId
	}

	if parentpiID == "" { // only publish on creation of top level process as this is the only place an execution is defined at
		wiState := &model.WorkflowState{
			ExecutionId:  executionId,
			WorkflowId:   wfID,
			WorkflowName: workflowName,
			Vars:         vrs,
			Id:           []string{executionId},
		}

		telemetry.CtxWithTraceParentToWfState(ctx, wiState)

		ctx, log = common.ContextLoggerWithWfState(ctx, wiState)
		log.Debug("just after adding wfState details to log ctx")

		// fire off the new workflow state
		if err := c.ns.PublishWorkflowState(ctx, messages.WorkflowExecutionExecute, wiState); err != nil {
			reterr = c.engineErr(ctx, "publish workflow instance execute", err,
				slog.String(keys.WorkflowName, workflowName),
				slog.String(keys.WorkflowID, wfID),
			)
			return "", "", reterr
		}
	}
	partOfCollaboration := false
	collabProcesses := make([]*model.Process, 0, len(wf.Collaboration.Participant))

	for _, i := range wf.Collaboration.Participant {
		if i.ProcessId == processName {
			partOfCollaboration = true
		}
		pr, ok := wf.Process[i.ProcessId]
		if !ok {
			return "", "", fmt.Errorf("find collaboration process with name %s: %w", processName, err)
		}
		collabProcesses = append(collabProcesses, pr)
	}
	var launchProcesses []*model.Process
	if partOfCollaboration {
		launchProcesses = collabProcesses

	} else {
		pr, ok := wf.Process[processName]
		if !ok {
			return "", "", fmt.Errorf("find process with name %s: %w", processName, err)
		}
		launchProcesses = append(launchProcesses, pr)
	}
	for _, pr := range launchProcesses {
		err2 := c.launchProcess(ctx, ID, pr.Name, pr, workflowName, wfID, executionId, vrs, parentpiID, parentElID, log)
		if err2 != nil {
			return "", "", err2
		}
	}

	return executionId, wfID, nil
}

func (c *Engine) launchProcess(ctx context.Context, ID common.TrackingID, prName string, pr *model.Process, workflowName string, wfID string, executionId string, vrs []byte, parentpiID string, parentElID string, log *slog.Logger) error {
	ctx, sp := c.tr.Start(ctx, "launchProcess")
	defer func() {
		sp.End()
	}()
	var reterr error
	var hasStartEvents bool

	testVars, err := vars.Decode(ctx, vrs)
	if err != nil {
		return fmt.Errorf("decode variables during launch: %w", err)
	}

	// Test to see if all variables are present.
	vErr := forEachStartElement(pr, func(el *model.Element) error {
		hasStartEvents = true
		if el.OutputTransform != nil {
			for _, v := range el.OutputTransform {
				evs, err := expression.GetVariables(v)
				if err != nil {
					return fmt.Errorf("extract variables from workflow during launch: %w", err)
				}
				for ev := range evs {
					if _, ok := testVars[ev]; !ok {
						return fmt.Errorf("workflow expects variable '%s': %w", ev, errors.ErrExpectedVar)
					}
				}
			}
		}
		return nil
	})

	if vErr != nil {
		reterr = fmt.Errorf("initialize all workflow start events: %w", vErr)
		return reterr
	}

	if hasStartEvents {

		pi, err := c.ns.CreateProcessInstance(ctx, executionId, parentpiID, parentElID, pr.Name, workflowName, wfID)
		if err != nil {
			reterr = fmt.Errorf("launch failed to create new process instance: %w", err)
			return reterr
		}

		errs := make(chan error)

		// for each start element, launch a workflow thread
		startErr := forEachStartElement(pr, func(el *model.Element) error {
			trackingID := ID.Push(pi.ProcessInstanceId).Push(ksuid.New().String())
			exec := &model.WorkflowState{
				ElementType: el.Type,
				ElementId:   el.Id,
				WorkflowId:  wfID,
				//WorkflowInstanceId: wfi.WorkflowInstanceId,
				ExecutionId:       executionId,
				Id:                trackingID,
				Vars:              vrs,
				WorkflowName:      workflowName,
				ProcessName:       prName,
				ProcessInstanceId: pi.ProcessInstanceId,
			}

			if trace.SpanContextFromContext(ctx).IsValid() {
				telemetry.CtxWithTraceParentToWfState(ctx, exec)
			} else {
				// If there is no valid span, then use the traceparent.
				exec.TraceParent = ctx.Value(ctxkey.Traceparent).(string)
			}
			ctx, log := common.ContextLoggerWithWfState(ctx, exec)
			log.Debug("just prior to publishing start msg")

			processWfState := proto.Clone(exec).(*model.WorkflowState)
			processTrackingId := ID.Push(executionId).Push(pi.ProcessInstanceId)
			processWfState.Id = processTrackingId

			if err := c.ns.PublishWorkflowState(ctx, subj.NS(messages.WorkflowProcessExecute, subj.GetNS(ctx)), processWfState); err != nil {
				return fmt.Errorf("publish workflow timed process execute: %w", err)
			}
			if err := c.ns.RecordHistoryProcessStart(ctx, exec); err != nil {
				log.Error("start events record process start", err)
				return fmt.Errorf("publish initial traversal: %w", err)
			}
			if err := c.ns.PublishWorkflowState(ctx, messages.WorkflowTraversalExecute, exec); err != nil {
				log.Error("publish initial traversal", err)
				return fmt.Errorf("publish initial traversal: %w", err)
			}
			return nil
		})
		if startErr != nil {
			reterr = startErr
			return reterr
		}
		// wait for all paths to be started
		close(errs)
		if err := <-errs; err != nil {
			reterr = c.engineErr(ctx, "initial traversal", err,
				slog.String(keys.ParentInstanceElementID, parentElID),
				slog.String(keys.ParentProcessInstanceID, parentpiID),
				slog.String(keys.WorkflowName, workflowName),
				slog.String(keys.WorkflowID, wfID),
			)
			return reterr
		}
	}
	return nil
}

func (c *Engine) rollBackLaunch(ctx context.Context, e *model.Execution) {
	log := logx.FromContext(ctx)
	log.Info("rolling back workflow launch")
	err := c.ns.PublishWorkflowState(ctx, messages.WorkflowExecutionAbort, &model.WorkflowState{
		//Id:           []string{e.WorkflowInstanceId},
		Id:           []string{e.ExecutionId},
		ExecutionId:  e.ExecutionId,
		WorkflowName: e.WorkflowName,
		WorkflowId:   e.WorkflowId,
		State:        model.CancellationState_terminated,
	})
	if err != nil {
		log.Error("workflow fatally terminated, however the termination signal could not be sent", err)
	}
}

// forEachStartElement finds all start elements for a given process and executes a function on the element.
func forEachStartElement(pr *model.Process, fn func(element *model.Element) error) error {
	for _, i := range pr.Elements {
		if i.Type == element.StartEvent {
			err := fn(i)
			if err != nil {
				return fmt.Errorf("start event execution: %w", err)
			}
		}
	}
	return nil
}

// traverse traverses all outbound connections provided the conditions passed if available.
func (c *Engine) traverse(ctx context.Context, pr *model.ProcessInstance, trackingID common.TrackingID, outbound *model.Targets, el map[string]*model.Element, state *model.WorkflowState) error {
	ctx, log := logx.ContextWith(ctx, "engine.traverse")
	if outbound == nil {
		return nil
	}
	commit := make(map[string]string, len(outbound.Target))
	// Traverse along all outbound edges
	for ord, t := range outbound.Target {
		if ord == int(outbound.DefaultTarget) {
			continue
		}
		ws := proto.Clone(state).(*model.WorkflowState)
		// Evaluate conditions
		ok := true
		for _, ex := range t.Conditions {
			// TODO: Cache compilation.
			exVars, err := vars.Decode(ctx, ws.Vars)
			if err != nil {
				return fmt.Errorf("decode variables for condition evaluation: %w", err)
			}

			// evaluate the condition
			res, err := expression.Eval[bool](ctx, ex, exVars)
			if err != nil {
				return &errors.ErrWorkflowFatal{Err: err}
			}
			if !res {
				ok = false
				break
			}
		}
		if ok {
			commit[t.Id] = t.Target
		}
	}

	if len(commit) == 0 && outbound.DefaultTarget != -1 {
		def := outbound.Target[outbound.DefaultTarget]
		commit[def.Id] = def.Target
	}

	elem := el[state.ElementId]

	reciprocatedDivergentGateway := elem.Type == element.Gateway && elem.Gateway.Direction == model.GatewayDirection_divergent && elem.Gateway.ReciprocalId != ""

	divergentGatewayReciprocalInstanceId := ksuid.New().String()

	// Check traversals from a reciprocated divergent gateway
	if reciprocatedDivergentGateway {

		ks := make([]string, 0, len(commit))
		for k := range commit {
			ks = append(ks, k)
		}
		if state.GatewayExpectations == nil {
			state.GatewayExpectations = make(map[string]*model.GatewayExpectations)
		}
		state.GatewayExpectations[divergentGatewayReciprocalInstanceId] = &model.GatewayExpectations{
			ExpectedPaths: ks,
		}
	}

	for branchID, elID := range commit {
		ws := proto.Clone(state).(*model.WorkflowState)
		newID := ksuid.New().String()
		tID := trackingID.Push(newID)
		target := el[elID]
		ws.Id = tID
		ws.ElementType = target.Type
		ws.ElementId = target.Id

		// Check traversals that lead to solitary convergent gateways
		if target.Type == element.Gateway && target.Gateway.Direction == model.GatewayDirection_convergent && target.Gateway.ReciprocalId == "" {
			if ws.SatisfiesGatewayExpectation == nil {
				ws.SatisfiesGatewayExpectation = make(map[string]*model.SatisfiesGateway)
			}
			if _, ok := ws.SatisfiesGatewayExpectation[target.Id]; !ok {
				ws.SatisfiesGatewayExpectation[target.Id] = &model.SatisfiesGateway{InstanceTracking: make([]string, 0)}
			}
			ws.SatisfiesGatewayExpectation[target.Id].InstanceTracking = append(ws.SatisfiesGatewayExpectation[target.Id].InstanceTracking, "-,"+branchID)
		}

		if reciprocatedDivergentGateway {
			if ws.SatisfiesGatewayExpectation == nil {
				ws.SatisfiesGatewayExpectation = make(map[string]*model.SatisfiesGateway)
			}
			if _, ok := ws.SatisfiesGatewayExpectation[elem.Gateway.ReciprocalId]; !ok {
				ws.SatisfiesGatewayExpectation[elem.Gateway.ReciprocalId] = &model.SatisfiesGateway{InstanceTracking: make([]string, 0)}
			}
			ws.SatisfiesGatewayExpectation[elem.Gateway.ReciprocalId].InstanceTracking = append(ws.SatisfiesGatewayExpectation[elem.Gateway.ReciprocalId].InstanceTracking, divergentGatewayReciprocalInstanceId+","+branchID)
		}

		if err := c.ns.PublishWorkflowState(ctx, messages.WorkflowTraversalExecute, ws); err != nil {
			log.Error("publish workflow state", err)
			return fmt.Errorf("publish workflow state: %w", err)
		}
	}
	return nil
}

// activityStartProcessor handles the behaviour of each BPMN element
func (c *Engine) activityStartProcessor(ctx context.Context, newActivityID string, traversal *model.WorkflowState, traverseOnly bool) error {
	ctx, log := logx.ContextWith(ctx, "engine.activityStartProcessor")
	// set the default status to be 'executing'
	status := model.CancellationState_executing

	// get the corresponding process instance
	pi, err := c.ns.GetProcessInstance(ctx, traversal.ProcessInstanceId)
	if errors2.Is(err, errors.ErrProcessInstanceNotFound) || errors2.Is(err, nats.ErrKeyNotFound) {
		// if the workflow instance has been removed kill any activity and exit
		log.Warn("process instance not found, cancelling activity", err, slog.String(keys.ProcessInstanceID, traversal.ProcessInstanceId))
		return nil
	} else if err != nil {
		return c.engineErr(ctx, "get process instance", err,
			slog.String(keys.ProcessInstanceID, traversal.ProcessInstanceId),
		)
	}

	// get the corresponding workflow definition
	workflow, err := c.ns.GetWorkflow(ctx, pi.WorkflowId)
	if err != nil {
		return c.engineErr(ctx, "get workflow", err,
			slog.String(keys.ExecutionID, pi.ExecutionId),
			slog.String(keys.WorkflowID, pi.WorkflowId),
		)
	}

	// create an indexed map of elements
	els := common.ElementTable(workflow)
	el := els[traversal.ElementId]

	// force traversal will not process the event, and will just traverse instead.
	if traverseOnly {
		el.Type = "forceTraversal"
	}

	activityID := common.TrackingID(traversal.Id).Pop().Push(newActivityID)

	newState := common.CopyWorkflowState(traversal)
	newState.Id = activityID
	// tell the world we are going to execute an activity
	if err := c.ns.PublishWorkflowState(ctx, messages.WorkflowActivityExecute, newState); err != nil {
		return c.engineErr(ctx, "publish workflow status", err, apErrFields(pi.ExecutionId, pi.WorkflowId, el.Id, el.Name, el.Type, workflow.Name)...)
	}
	// log this with history
	if err := c.ns.RecordHistoryActivityExecute(ctx, newState); err != nil {
		return c.engineErr(ctx, "publish process history", err, apErrFields(pi.ExecutionId, pi.WorkflowId, el.Id, el.Name, el.Type, workflow.Name)...)
	}

	// tell the world we have safely completed the traversal
	if err := c.ns.PublishWorkflowState(ctx, messages.WorkflowTraversalComplete, traversal); err != nil {
		return c.engineErr(ctx, "publish traversal status", err, apErrFields(pi.ExecutionId, pi.WorkflowId, el.Id, el.Name, el.Type, workflow.Name)...)
	}

	//Start any timers
	if el.BoundaryTimer != nil || len(el.BoundaryTimer) > 0 {
		for _, i := range el.BoundaryTimer {
			ai := i
			timerState := common.CopyWorkflowState(newState)
			timerState.Execute = &ai.Target
			timerState.UnixTimeNano = time.Now().UnixNano()
			timerState.Timer = &model.WorkflowTimer{LastFired: 0, Count: 0}
			v, err := vars.Decode(ctx, traversal.Vars)
			if err != nil {
				return fmt.Errorf("decode boundary timer variable: %w", err)
			}
			res, err := expression.EvalAny(ctx, i.Duration, v)
			if err != nil {
				return fmt.Errorf("evaluate boundary timer expression: %w", err)
			}
			ut := time.Now()
			switch x := res.(type) {
			case int:
				ut = ut.Add(time.Duration(x))
			case string:
				dur, err := parser.ParseISO8601(x)
				if err != nil {
					return fmt.Errorf("parse ISO8601 boundary timer value: %w", err)
				}
				ut = dur.Shift(ut)
			}
			err = c.ns.PublishWorkflowState(ctx, subj.NS(messages.WorkflowElementTimedExecute, subj.GetNS(ctx)), timerState, storage.WithEmbargo(int(ut.UnixNano())))
			if err != nil {
				return fmt.Errorf("publish timed execute during activity start: %w", err)
			}
		}
	}

	// process any supported events
	switch el.Type {
	case element.StartEvent:
		initVars := make([]byte, 0)
		err := vars.OutputVars(ctx, traversal.Vars, &initVars, el.OutputTransform)
		if err != nil {
			return fmt.Errorf("get output vars for start event: %w", err)
		}
		traversal.Vars = initVars
		newState.State = status
		newState.Vars = traversal.Vars
		if err := c.completeActivity(ctx, newState); err != nil {
			return fmt.Errorf("start event complete activity: %w", err)
		}
	case element.Gateway:
		completeActivityState := common.CopyWorkflowState(newState)
		completeActivityState.State = status
		//
		if el.Gateway.Direction == model.GatewayDirection_convergent {
			if err := c.ns.PublishWorkflowState(ctx, messages.WorkflowJobGatewayTaskActivate, completeActivityState); err != nil {
				return fmt.Errorf("%s failed to activate gateway: %w", errors.Fn(), err)
			}
		} else {
			if err := c.completeActivity(ctx, completeActivityState); err != nil {
				return fmt.Errorf("complete activity for exclusive gateway: %w", err)
			}
		}
	case element.ServiceTask:
		if el.Version == nil {
			v, err := c.ns.GetTaskSpecUID(ctx, el.Execute)
			if errors2.Is(err, nats.ErrKeyNotFound) {
				return fmt.Errorf("engine failed to get task spec id: %w", &errors.ErrWorkflowFatal{Err: err})
			}
			el.Version = &v
		} else {
			def, err := c.ns.GetTaskSpecByUID(ctx, *el.Version)
			if err != nil {
				return fmt.Errorf("get tsask spec by uid: %w", err)
			}
			if def.Behaviour != nil && def.Behaviour.Mock {
				err := c.mockCompleteServiceTask(ctx, def, el, newState)
				if err != nil {
					return fmt.Errorf("mocked service task '%s' failed: %w", el.Execute, err)
				}
				return nil
			}
		}
		if err != nil {
			return fmt.Errorf("get service task routing key during activity start processor: %w", err)
		}
		if err := c.startJob(ctx, messages.WorkflowJobServiceTaskExecute+"."+*el.Version, newState, el, traversal.Vars); err != nil {
			return c.engineErr(ctx, "start service task job", err, apErrFields(pi.ProcessInstanceId, pi.WorkflowId, el.Id, el.Name, el.Type, workflow.Name)...)
		}
	case element.UserTask:
		if err := c.startJob(ctx, messages.WorkflowJobUserTaskExecute, newState, el, traversal.Vars); err != nil {
			return c.engineErr(ctx, "start user task job", err, apErrFields(pi.ProcessInstanceId, pi.WorkflowId, el.Id, el.Name, el.Type, workflow.Name)...)
		}
	case element.ManualTask:
		if err := c.startJob(ctx, messages.WorkflowJobManualTaskExecute, newState, el, traversal.Vars); err != nil {
			return c.engineErr(ctx, "start manual task job", err, apErrFields(pi.ProcessInstanceId, pi.WorkflowId, el.Id, el.Name, el.Type, workflow.Name)...)
		}
	case element.MessageIntermediateThrowEvent:
		wf, err := c.ns.GetWorkflow(ctx, pi.WorkflowId)
		if err != nil {
			return fmt.Errorf("get workflow for intermediate throw event: %w", err)
		}
		ix := -1
		for i, v := range wf.Messages {
			if v.Name == el.Execute {
				ix = i
				break
			}
		}
		if ix == -1 {
			// TODO: Fatal workflow error - we shouldn't allow to send unknown messages in parser
			return &errors.ErrWorkflowFatal{Err: fmt.Errorf("unknown workflow message name: %s", el.Execute)}
		}
		msgState := common.CopyWorkflowState(newState)
		msgState.Condition = &wf.Messages[ix].Execute

		if err := c.startJob(ctx, messages.WorkflowJobSendMessageExecute+"."+pi.WorkflowName+"_"+el.Execute, newState, el, traversal.Vars); err != nil {
			return c.engineErr(ctx, "start message job", err, apErrFields(pi.ProcessInstanceId, pi.WorkflowId, el.Id, el.Name, el.Type, workflow.Name)...)
		}
	case element.CallActivity:
		if err := c.startJob(ctx, subj.NS(messages.WorkflowJobLaunchExecute, subj.GetNS(ctx)), newState, el, traversal.Vars); err != nil {
			return c.engineErr(ctx, "start message launch", err, apErrFields(pi.ProcessInstanceId, pi.WorkflowId, el.Id, el.Name, el.Type, workflow.Name)...)
		}
	case element.MessageIntermediateCatchEvent:
		awaitMsg := common.CopyWorkflowState(newState)
		awaitMsg.Execute = &el.Execute
		awaitMsg.Condition = &el.Msg
		if err := c.startJob(ctx, messages.WorkflowJobAwaitMessageExecute, awaitMsg, el, awaitMsg.Vars); err != nil {
			return c.engineErr(ctx, "start await message task job", err, apErrFields(pi.ProcessInstanceId, pi.WorkflowId, el.Id, el.Name, el.Type, workflow.Name)...)
		}
	case element.TimerIntermediateCatchEvent:
		varmap, err := vars.Decode(ctx, traversal.Vars)
		if err != nil {
			return &errors.ErrWorkflowFatal{Err: err}
		}
		ret, err := expression.EvalAny(ctx, el.Execute, varmap)
		if err != nil {
			return &errors.ErrWorkflowFatal{Err: err}
		}
		var embargo int
		switch em := ret.(type) {
		case string:
			if v, err := strconv.Atoi(em); err == nil {
				embargo = v + int(time.Now().UnixNano())
				break
			}
			pem, err := parser.ParseISO8601(em)
			if err != nil {
				return &errors.ErrWorkflowFatal{Err: err}
			}
			embargo = int(pem.Shift(time.Now()).UnixNano())
		case int:
			embargo = em + int(time.Now().UnixNano())
		default:
			return errors.ErrFatalBadDuration
		}
		newState.Id = common.TrackingID(newState.Id).Push(ksuid.New().String())
		if err := c.ns.PublishWorkflowState(ctx, subj.NS(messages.WorkflowJobTimerTaskExecute, subj.GetNS(ctx)), newState); err != nil {
			return fmt.Errorf("publish timer task execute job: %w", err)
		}
		if err := c.ns.PublishWorkflowState(ctx, subj.NS(messages.WorkflowJobTimerTaskComplete, subj.GetNS(ctx)), newState, storage.WithEmbargo(embargo)); err != nil {
			return fmt.Errorf("publish timer task execute complete: %w", err)
		}
	case element.EndEvent:
		if pi.ParentProcessId == nil || *pi.ParentProcessId == "" {
			if len(el.Errors) == 0 {
				status = model.CancellationState_completed
			} else {
				status = model.CancellationState_errored
			}
		}
		newState.State = status
		if err := c.completeActivity(ctx, newState); err != nil {
			return fmt.Errorf("complete activity for end event: %w", err)
		}
	case element.LinkIntermediateThrowEvent:
		newState.State = status
		if err := c.completeActivity(ctx, newState); err != nil {
			return fmt.Errorf("default complete activity: %w", err)
		}
	default:
		// if we don't support the event, just traverse to the next element
		newState.State = status
		if err := c.completeActivity(ctx, newState); err != nil {
			return fmt.Errorf("default complete activity: %w", err)
		}
	}

	// if the workflow is complete, send an instance complete message to trigger tidy up
	if status == model.CancellationState_completed || status == model.CancellationState_errored || status == model.CancellationState_terminated {
		newState.Id = []string{pi.ProcessInstanceId}
		newState.State = status
		newState.Error = el.Error
		if err := c.ns.PublishWorkflowState(ctx, messages.WorkflowProcessComplete, newState); err != nil {
			return c.engineErr(ctx, "publish workflow status", err, apErrFields(pi.ProcessInstanceId, pi.WorkflowId, el.Id, el.Name, el.Type, workflow.Name)...)
		}
	}
	return nil
}

func (c *Engine) mockCompleteServiceTask(ctx context.Context, def *model.TaskSpec, el *model.Element, traversal *model.WorkflowState) error {
	state := common.CopyWorkflowState(traversal)
	// Extract workflow inputs
	localVars := make(map[string]interface{})
	processVars := make(map[string]interface{})
	if el.InputTransform != nil {
		var err error
		processVars, err = vars.Decode(ctx, state.Vars)
		if err != nil {
			return &errors.ErrWorkflowFatal{Err: fmt.Errorf("decode old input variables: %w", err)}
		}
		for k, v := range el.InputTransform {
			res, err := expression.EvalAny(ctx, v, processVars)
			if err != nil {
				return &errors.ErrWorkflowFatal{Err: fmt.Errorf("input transform expression evalutaion failed: %w", err)}
			}
			localVars[k] = res
		}
	}

	if def.Parameters != nil {
		// Inject missing inputs
		if def.Parameters.Input != nil {
			for _, v := range def.Parameters.Input {
				if _, ok := localVars[v.Name]; !ok && v.Example != "" {
					res, err := expression.EvalAny(ctx, v.Example, localVars)
					if err != nil {
						return &errors.ErrWorkflowFatal{Err: fmt.Errorf("evaluate example input value expression: %w", err)}
					}
					localVars[v.Name] = res
				}
			}
		}

		// Transform for example outputs
		if def.Parameters.Output != nil {
			for _, v := range def.Parameters.Output {
				if v.Example != "" {
					res, err := expression.EvalAny(ctx, v.Example, localVars)
					if err != nil {
						return &errors.ErrWorkflowFatal{Err: fmt.Errorf("evaluate example value expression: %w", err)}
					}
					localVars[v.Name] = res
				}
			}
		}
	}

	// Set process vars
	for k, v := range el.OutputTransform {
		res, err := expression.EvalAny(ctx, v, localVars)
		if err != nil {
			return fmt.Errorf("evaluate output transform expression: %w", err)
		}
		processVars[k] = res
	}
	b, err := vars.Encode(ctx, processVars)
	if err != nil {
		return &errors.ErrWorkflowFatal{Err: fmt.Errorf("encode output process variables: %w", err)}
	}
	state.Vars = b

	common.DropStateParams(state)

	if err := c.ns.PublishWorkflowState(ctx, messages.WorkflowActivityComplete, state); err != nil {
		return c.engineErr(ctx, "publish workflow cancellationState", err)
		//TODO: report this without process: apErrFields(wfi.WorkflowInstanceId, wfi.WorkflowId, el.Id, el.Name, el.Type, process.Name)
	}
	if err := c.ns.RecordHistoryActivityComplete(ctx, state); err != nil {
		return c.engineErr(ctx, "record history activity complete", &errors.ErrWorkflowFatal{Err: err})
	}
	return nil
}

func (c *Engine) completeActivity(ctx context.Context, state *model.WorkflowState) error {
	// tell the world that we processed the activity
	common.DropStateParams(state)
	if err := c.ns.PublishWorkflowState(ctx, messages.WorkflowActivityComplete, state); err != nil {
		return c.engineErr(ctx, "publish workflow cancellationState", err)
		//TODO: report this without process: apErrFields(wfi.WorkflowInstanceId, wfi.WorkflowId, el.Id, el.Name, el.Type, process.Name)
	}
	if err := c.ns.RecordHistoryActivityComplete(ctx, state); err != nil {
		return c.engineErr(ctx, "record history activity complete", &errors.ErrWorkflowFatal{Err: err})
	}
	return nil
}

// apErrFields writes out the common error fields for an application error
func apErrFields(executionID, workflowID, elementID, elementName, elementType, workflowName string, extraFields ...any) []any {
	fields := []any{
		slog.String(keys.ExecutionID, executionID),
		slog.String(keys.WorkflowID, workflowID),
		slog.String(keys.ElementID, elementID),
		slog.String(keys.ElementName, elementName),
		slog.String(keys.ElementType, elementType),
		slog.String(keys.WorkflowName, workflowName),
	}
	if len(extraFields) > 0 {
		fields = append(fields, extraFields...)
	}
	return fields
}

// completeJobProcessor processes completed jobs
func (c *Engine) completeJobProcessor(ctx context.Context, job *model.WorkflowState) error {
	ctx, log := logx.ContextWith(ctx, "engine.completeJobProcessor")
	// Validate if it safe to end this job
	// Get the saved job state
	if _, err := c.ns.GetOldState(ctx, common.TrackingID(job.Id).ParentID()); errors2.Is(err, errors.ErrStateNotFound) {
		// We can't find the job's saved state
		return nil
	} else if err != nil {
		return fmt.Errorf("get old state for complete job processor: %w", err)
	}

	// TODO: CHeck Workflow instance exists
	// get the relevant workflow instance
	pi, err := c.ns.GetProcessInstance(ctx, job.ProcessInstanceId)
	if errors2.Is(err, errors.ErrProcessInstanceNotFound) {
		// if the instance has been deleted quash this activity
		log.Warn("process instance not found, cancelling job processing", err, slog.String(keys.ExecutionID, job.ExecutionId))
		return nil
	} else if err != nil {
		log.Warn("get process instance for job", err,
			slog.String(keys.JobType, job.ElementType),
			slog.String(keys.JobID, common.TrackingID(job.Id).ID()),
		)
		return fmt.Errorf("get workflow instance for job: %w", err)
	}

	// get the relevant workflow
	wf, err := c.ns.GetWorkflow(ctx, pi.WorkflowId)
	if err != nil {
		return c.engineErr(ctx, "fetch job workflow", err,
			slog.String(keys.JobType, job.ElementType),
			slog.String(keys.JobID, common.TrackingID(job.Id).ID()),
			slog.String(keys.ExecutionID, pi.ExecutionId),
			slog.String(keys.WorkflowID, pi.WorkflowId),
		)
	}
	// build element table
	els := common.ElementTable(wf)
	el := els[job.ElementId]
	newID := common.TrackingID(job.Id).Pop()
	oldState, err := c.ns.GetOldState(ctx, newID.ID())
	if errors2.Is(err, errors.ErrStateNotFound) {
		return nil
	}
	if err != nil {
		return fmt.Errorf("complete job processor failed to get old state: %w", err)
	}
	if err := vars.OutputVars(ctx, job.Vars, &oldState.Vars, el.OutputTransform); err != nil {
		return fmt.Errorf("complete job processor failed to transform variables: %w", err)
	}
	completeActivityState := common.CopyWorkflowState(oldState)
	completeActivityState.Id = newID
	completeActivityState.State = job.State
	completeActivityState.ElementId = el.Id
	completeActivityState.ElementType = el.Type
	if err := c.completeActivity(ctx, completeActivityState); err != nil {
		return fmt.Errorf("complete job processor failed to complete activity: %w", err)
	}
	if err := c.ns.DeleteJob(ctx, common.TrackingID(job.Id).ID()); err != nil {
		return fmt.Errorf("complete job processor failed to delete job: %w", err)
	}
	return nil
}

// startJob launches a user/service task
func (c *Engine) startJob(ctx context.Context, subject string, job *model.WorkflowState, el *model.Element, v []byte, opts ...storage.PublishOpt) error {
	job.Execute = &el.Execute

	// el.Version is only used for versioned tasks such as service tasks
	if el.Version != nil {
		job.ExecuteVersion = *el.Version
	}
	// skip if this job type requires no input transformation
	if el.Type != element.MessageIntermediateCatchEvent {
		job.Vars = nil
		if err := vars.InputVars(ctx, v, &job.Vars, el); err != nil {
			return &errors.ErrWorkflowFatal{Err: fmt.Errorf("start job failed to get input variables: %w", err)}
		}
	}
	// if this is a user task, find out who can perfoem it
	if el.Type == element.UserTask {
		vx, err := vars.Decode(ctx, v)
		if err != nil {
			return &errors.ErrWorkflowFatal{Err: fmt.Errorf("start job failed to decode input variables: %w", err)}
		}

		owners, err := c.evaluateOwners(ctx, el.Candidates, vx)
		if err != nil {
			return &errors.ErrWorkflowFatal{Err: fmt.Errorf("start job: evaluate owners: %w", err)}
		}
		groups, err := c.evaluateOwners(ctx, el.CandidateGroups, vx)
		if err != nil {
			return &errors.ErrWorkflowFatal{Err: fmt.Errorf("start job failed to evaluate groups: %w", err)}
		}

		job.Owners = owners
		job.Groups = groups
	}

	// create the job
	_, err := c.ns.CreateJob(ctx, job)
	if err != nil {
		return c.engineErr(ctx, "start manual task", err,
			slog.String(keys.ElementName, el.Name),
			slog.String(keys.ElementID, el.Id),
			slog.String(keys.ElementType, el.Type),
			slog.String(keys.JobType, job.ElementType),
			slog.String(keys.JobID, common.TrackingID(job.Id).ID()),
			slog.String(keys.ExecutionID, job.ExecutionId),
		)
	}
	/*
		//Save Iterator State
		common.SaveLargeObj

		// Multi-instance
		if el.Iteration != nil {
			if el.Iteration.Execute == model.ThreadingType_Sequential {
				// Launch as usual, just with iteration parameters
				seqVars, err := vars.Decode(ctx, job.Vars)
				if err != nil {
					return &errors.ErrWorkflowFatal{Err: fmt.Errorf("start job failed to decode input variables: %w", err)}
				}
				collection, ok := seqVars[el.Iteration.Collection]
				if !ok {
					return &errors.ErrWorkflowFatal{Err: fmt.Errorf("start job failed to decode input variables: %w", err)}
				}
				seqVars[el.Iteration.Iterator] = getCollectionIndex[collection]
			} else if model.ThreadingType_Parallel {

			}
		}
	*/
	// Single instance launch
	if el.Iteration == nil {
		if err := c.ns.PublishWorkflowState(ctx, subj.NS(subject, subj.GetNS(ctx)), job, opts...); err != nil {
			return fmt.Errorf("start job failed to publish: %w", err)
		}
		// finally tell the engine that the job is ready for a client
		return nil
	}
	return nil
}

// evaluateOwners builds a list of groups
func (c *Engine) evaluateOwners(ctx context.Context, owners string, vars model.Vars) ([]string, error) {
	jobGroups := make([]string, 0)
	groups, err := expression.Eval[interface{}](ctx, owners, vars)
	if err != nil {
		return nil, &errors.ErrWorkflowFatal{Err: err}
	}
	switch groups := groups.(type) {
	case string:
		jobGroups = append(jobGroups, groups)
	case []string:
		jobGroups = append(jobGroups, groups...)
	}
	for i, v := range jobGroups {
		id, err := c.ns.OwnerID(ctx, v)
		if err != nil {
			return nil, fmt.Errorf("evaluate owners failed to get owner ID: %w", err)
		}
		jobGroups[i] = id
	}
	return jobGroups, nil
}

func (c *Engine) engineErr(ctx context.Context, msg string, err error, z ...any) error {
	log := logx.FromContext(ctx)
	z = append(z, "error", err.Error())
	log.Error(msg, err, z)

	return fmt.Errorf("engine-error: %w", err)
}

// Shutdown gracefully stops the engine.
func (c *Engine) Shutdown() {
	select {
	case <-c.closing:
		return
	default:
		close(c.closing)
		c.ns.Shutdown()
		return
	}
}

// CancelProcessInstance cancels a workflow instance with a reason.
func (c *Engine) CancelProcessInstance(ctx context.Context, state *model.WorkflowState) error {
	if state.State == model.CancellationState_executing {
		return fmt.Errorf("executing is an invalid cancellation state: %w", errors.ErrInvalidState)
	}
	if err := c.ns.XDestroyProcessInstance(ctx, state); err != nil {
		return fmt.Errorf("cancel workflow instance failed: %w", errors.ErrCancelFailed)
	}
	return nil
}

// CompleteManualTask completes a manual workflow task
func (c *Engine) CompleteManualTask(ctx context.Context, job *model.WorkflowState, newvars []byte) error {
	el, err := c.ns.GetElement(ctx, job)
	if err != nil {
		return &errors.ErrWorkflowFatal{Err: err}
	}
	job.Vars = newvars
	err = vars.CheckVars(ctx, job, el)
	if err != nil {
		return &errors.ErrWorkflowFatal{Err: err}
	}
	if err := c.ns.PublishWorkflowState(ctx, messages.WorkflowJobManualTaskComplete, job); err != nil {
		return fmt.Errorf("complete manual task failed to publish manual task complete message: %w", err)
	}
	return nil
}

// CompleteServiceTask completes a workflow service task
func (c *Engine) CompleteServiceTask(ctx context.Context, job *model.WorkflowState, newvars []byte) error {
	if _, err := c.ns.GetOldState(ctx, common.TrackingID(job.Id).ParentID()); errors2.Is(err, errors.ErrStateNotFound) {
		if err := c.ns.PublishWorkflowState(ctx, subj.NS(messages.WorkflowJobServiceTaskAbort, subj.GetNS(ctx)), job); err != nil {
			return fmt.Errorf("complete service task failed to publish workflow state: %w", err)
		}
		return nil
	} else if err != nil {
		return fmt.Errorf("complete service task failed to get old state: %w", err)
	}
	el, err := c.ns.GetElement(ctx, job)
	if err != nil {
		return &errors.ErrWorkflowFatal{Err: err}
	}
	job.Vars = newvars
	err = vars.CheckVars(ctx, job, el)
	if err != nil {
		return &errors.ErrWorkflowFatal{Err: err}
	}
	if err := c.ns.PublishWorkflowState(ctx, messages.WorkflowJobServiceTaskComplete, job); err != nil {
		return fmt.Errorf("complete service task failed to publish service task complete message: %w", err)
	}
	return nil
}

// CompleteSendMessageTask completes a send message task
func (c *Engine) CompleteSendMessageTask(ctx context.Context, job *model.WorkflowState, newvars []byte) error {
	_, err := c.ns.GetElement(ctx, job)
	if err != nil {
		return &errors.ErrWorkflowFatal{Err: err}
	}
	if err := c.ns.PublishWorkflowState(ctx, messages.WorkflowJobSendMessageComplete, job); err != nil {
		return fmt.Errorf("complete send message task failed to publish send message complete nats message: %w", err)
	}
	return nil
}

// CompleteUserTask completes and closes a user task with variables
func (c *Engine) CompleteUserTask(ctx context.Context, job *model.WorkflowState, newvars []byte) error {
	el, err := c.ns.GetElement(ctx, job)
	if err != nil {
		return &errors.ErrWorkflowFatal{Err: err}
	}
	job.Vars = newvars
	err = vars.CheckVars(ctx, job, el)
	if err != nil {
		return &errors.ErrWorkflowFatal{Err: err}
	}
	if err := c.ns.PublishWorkflowState(ctx, messages.WorkflowJobUserTaskComplete, job); err != nil {
		return fmt.Errorf("complete user task failed to publish user task complete message: %w", err)
	}
	if err := c.ns.CloseUserTask(ctx, common.TrackingID(job.Id).ID()); err != nil {
		return fmt.Errorf("complete user task failed to close user task: %w", err)
	}
	return nil
}

func (c *Engine) activityCompleteProcessor(ctx context.Context, state *model.WorkflowState) error {
	ctx, log := logx.ContextWith(ctx, "engine.activityCompleteProcessor")
	if old, err := c.ns.GetOldState(ctx, common.TrackingID(state.Id).ID()); errors2.Is(err, errors.ErrStateNotFound) {
		log.Warn("old state not found", slog.Any("error", err))
		return nil
	} else if err != nil {
		return fmt.Errorf("activity complete processor failed to get old state: %w", err)
	} else if old.State == model.CancellationState_obsolete && state.State == model.CancellationState_obsolete {
		return nil
	}

	pi, pierr := c.ns.GetProcessInstance(ctx, state.ProcessInstanceId)
	if errors2.Is(pierr, errors.ErrProcessInstanceNotFound) {
		errTxt := "process instance not found"
		log.Warn(errTxt, slog.String(keys.ProcessInstanceID, state.ProcessInstanceId))
	} else if pierr != nil {
		return fmt.Errorf("activity complete processor failed to get process instance: %w", pierr)
	}

	wf, err := c.ns.GetWorkflow(ctx, state.WorkflowId)
	if err != nil {
		return fmt.Errorf("activity complete processor failed to get workflow: %w", err)
	}

	els := common.ElementTable(wf)
	newID := common.TrackingID(state.Id).Pop()
	el := els[state.ElementId]
	// intermediateLinkCatchEvent - manually attach outbound connections.
	if el.Type == element.LinkIntermediateThrowEvent {
		var target *model.Element
		for _, elTest := range els {
			if elTest.Type == element.LinkIntermediateCatchEvent && elTest.Execute == el.Execute {
				target = elTest
				break
			}
		}
		if target == nil {
			return &errors.ErrWorkflowFatal{Err: errors2.New("corresponding catch not found")}
		}
		el.Outbound = &model.Targets{Target: []*model.Target{{Target: target.Id}}}
	}
	if pierr == nil {
		if err = c.traverse(ctx, pi, newID, el.Outbound, els, state); errors.IsWorkflowFatal(err) {
			log.Error("workflow fatally terminated whilst traversing", err, slog.String(keys.ProcessInstanceID, pi.ProcessInstanceId), slog.String(keys.WorkflowID, pi.WorkflowId), slog.String(keys.ElementID, state.ElementId))
			return nil
		} else if err != nil {
			return fmt.Errorf("activity complete processor failed traversal attempt: %w", err)
		}
	}
	if state.ElementType == element.EndEvent && len(state.Id) > 2 {
		jobID := common.TrackingID(state.Id).Ancestor(2)
		// If we are a sub workflow then complete the parent job
		if jobID != state.ExecutionId {
			j, joberr := c.ns.GetJob(ctx, jobID)
			if errors2.Is(joberr, errors.ErrJobNotFound) {
				log.Warn("job not found " + jobID + " : " + err.Error())
			} else if joberr != nil {
				return fmt.Errorf("activity complete processor failed to get job: %w", joberr)
			}
			if joberr == nil {
				j.Vars = state.Vars
				j.Error = state.Error
				if err := c.ns.PublishWorkflowState(ctx, messages.WorkflowJobLaunchComplete, j); err != nil {
					return fmt.Errorf("activity complete processor failed to publish job launch complete: %w", err)
				}
			}
			if err := c.ns.DeleteJob(ctx, jobID); err != nil && !errors2.Is(err, nats.ErrKeyNotFound) {
				return fmt.Errorf("activity complete processor failed to delete job %s: %w", jobID, err)
			}
			execution, eerr := c.ns.GetExecution(ctx, state.ExecutionId)
			if eerr != nil && !errors2.Is(eerr, nats.ErrKeyNotFound) {
				return fmt.Errorf("activity complete processor failed to get execution: %w", err)
			}
			if pierr == nil {
				if err := c.ns.DestroyProcessInstance(ctx, state, pi, execution); err != nil && !errors2.Is(err, nats.ErrKeyNotFound) {
					return fmt.Errorf("activity complete processor failed to destroy execution: %w", err)
				}
			}
		}
	}
	return nil
}

func (c *Engine) launchProcessor(ctx context.Context, state *model.WorkflowState) error {
	wf, err := c.ns.GetWorkflow(ctx, state.WorkflowId)
	if err != nil {
		return &errors.ErrWorkflowFatal{Err: errors.ErrWorkflowNotFound}
	}
	els := common.ElementTable(wf)
	ctx = context.WithValue(ctx, ctxkey.Traceparent, state.TraceParent)
	if _, _, err := c.launch(ctx, els[state.ElementId].Execute, state.Id, state.Vars, state.ProcessInstanceId, state.ElementId); err != nil {
		return c.engineErr(ctx, "launch child workflow", &errors.ErrWorkflowFatal{Err: err})
	}
	return nil
}

func (c *Engine) timedExecuteProcessor(ctx context.Context, state *model.WorkflowState, execution *model.Execution, due int64) (bool, int, error) {
	ctx, log := logx.ContextWith(ctx, "engine.timedExecuteProcessor")
	slog.Info("timedExecuteProcessor")
	wf, err := c.ns.GetWorkflow(ctx, state.WorkflowId)
	if err != nil {
		log.Error("get timer proto workflow: %s", err)
		return true, 0, fmt.Errorf("get timer proto workflow: %w", err)
	}

	els := common.ElementTable(wf)
	el := els[state.ElementId]

	now := time.Now().UnixNano()
	lastFired := state.Timer.LastFired
	elapsed := now - lastFired
	count := state.Timer.Count
	repeat := el.Timer.Repeat
	value := el.Timer.Value
	fireNext := lastFired + (value * 2)

	newTimer := proto.Clone(state).(*model.WorkflowState)

	newTimer.Timer = &model.WorkflowTimer{
		LastFired: now,
		Count:     count + 1,
	}

	var (
		isTimer    bool
		shouldFire bool
	)

	switch el.Timer.Type {
	case model.WorkflowTimerType_fixed:
		isTimer = true
		shouldFire = value <= now
	case model.WorkflowTimerType_duration:
		if repeat != 0 && count >= repeat {
			return true, 0, nil
		}
		isTimer = true
		shouldFire = elapsed >= value
	}

	if isTimer {
		if shouldFire {
			exec, err := c.ns.CreateExecution(ctx, &model.Execution{
				WorkflowId:   state.WorkflowId,
				WorkflowName: state.WorkflowName,
			})
			if err != nil {
				log.Error("creating execution instance", err)
				return false, 0, fmt.Errorf("creating timed workflow instance: %w", err)
			}

			pi, err := c.ns.CreateProcessInstance(ctx, exec.ExecutionId, "", "", state.ProcessName, wf.Name, state.WorkflowId)
			if err != nil {
				log.Error("creating timed process instance", err)
				return false, 0, fmt.Errorf("creating timed workflow instance: %w", err)
			}
			state.ExecutionId = pi.ExecutionId
			state.ProcessInstanceId = pi.ProcessInstanceId

			processWfState := proto.Clone(state).(*model.WorkflowState)
			processWfState.TraceParent = telemetry.NewTraceParentWithEmptySpan(telemetry.NewTraceID())
			processTrackingId := common.TrackingID([]string{}).Push(state.ExecutionId).Push(state.ProcessInstanceId)
			processWfState.Id = processTrackingId

			if err := c.ns.PublishWorkflowState(ctx, messages.WorkflowProcessExecute, processWfState); err != nil {
				log.Error("spawning process", err)
				return false, 0, nil
			}
			if err := c.ns.RecordHistoryProcessStart(ctx, state); err != nil {
				log.Error("start events record process start", err)
				return false, 0, fmt.Errorf("publish initial traversal: %w", err)
			}
			if err := vars.OutputVars(ctx, newTimer.Vars, &newTimer.Vars, el.OutputTransform); err != nil {
				log.Error("merging variables", err)
				return false, 0, nil
			}
			if err := c.traverse(ctx, pi, []string{ksuid.New().String()}, el.Outbound, els, state); err != nil {
				log.Error("traversing for timed workflow instance", err)
				return false, 0, nil
			}
			if err := c.ns.PublishWorkflowState(ctx, messages.WorkflowTimedExecute, newTimer); err != nil {
				log.Error("publishing timer", err)
				return false, int(fireNext), nil
			}
		} else if el.Timer.Type == model.WorkflowTimerType_duration {
			return false, int(fireNext - now), nil
		}
	}
	return true, 0, nil
}

func (c *Engine) abortProcessor(_ context.Context, abort services.AbortType, _ *model.WorkflowState) (bool, error) {
	switch abort {
	case services.AbortTypeActivity:
	case services.AbortTypeServiceTask:
	}
	return true, nil
}
