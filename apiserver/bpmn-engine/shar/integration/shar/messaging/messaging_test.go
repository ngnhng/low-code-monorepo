package messaging

import (
	"context"
	"fmt"
	"github.com/segmentio/ksuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gitlab.com/shar-workflow/shar/client"
	"gitlab.com/shar-workflow/shar/client/taskutil"
	support "gitlab.com/shar-workflow/shar/integration-support"
	"gitlab.com/shar-workflow/shar/model"
	"log/slog"
	"os"
	"sync"
	"testing"
	"time"
)

//goland:noinspection GoNilness
func TestMessaging(t *testing.T) {
	t.Parallel()
	ns := ksuid.New().String()
	ctx := context.Background()
	cl := client.New(client.WithEphemeralStorage(), client.WithConcurrency(10), client.WithNamespace(ns))
	err := cl.Dial(ctx, tst.NatsURL)
	require.NoError(t, err)

	handlers := &testMessagingHandlerDef{t: t, wg: sync.WaitGroup{}, tst: tst, finished: make(chan struct{})}

	// Register service tasks
	err = taskutil.RegisterTaskYamlFile(ctx, cl, "messaging_test_step1.yaml", handlers.step1)
	require.NoError(t, err)
	err = taskutil.RegisterTaskYamlFile(ctx, cl, "messaging_test_step2.yaml", handlers.step2)
	require.NoError(t, err)

	// Load BPMN workflow
	b, err := os.ReadFile("../../../testdata/message-workflow.bpmn")
	require.NoError(t, err)
	_, err = cl.LoadBPMNWorkflowFromBytes(ctx, "TestMessaging", b)
	require.NoError(t, err)

	err = cl.RegisterMessageSender(ctx, "TestMessaging", "continueMessage", handlers.sendMessage)
	require.NoError(t, err)
	err = cl.RegisterProcessComplete("Process_03llwnm", handlers.processEnd)
	require.NoError(t, err)

	// Launch the processes
	_, _, err = cl.LaunchProcess(ctx, "Process_0hgpt6k", model.Vars{"orderId": 57})
	if err != nil {
		t.Fatal(err)
		return
	}

	// Listen for service tasks
	go func() {
		err := cl.Listen(ctx)
		require.NoError(t, err)
	}()
	support.WaitForChan(t, handlers.finished, 20*time.Second)

	tst.AssertCleanKV(ns, t, 60*time.Second)
}

func TestMessageNameGlobalUniqueness(t *testing.T) {
	t.Parallel()
	ns := ksuid.New().String()
	ctx := context.Background()
	cl := client.New(client.WithEphemeralStorage(), client.WithConcurrency(10), client.WithNamespace(ns))
	err := cl.Dial(ctx, tst.NatsURL)
	require.NoError(t, err)

	handlers := &testMessagingHandlerDef{t: t, wg: sync.WaitGroup{}, tst: tst, finished: make(chan struct{})}

	// Register service tasks
	err = taskutil.RegisterTaskYamlFile(ctx, cl, "messaging_test_step1.yaml", handlers.step1)
	require.NoError(t, err)
	err = taskutil.RegisterTaskYamlFile(ctx, cl, "messaging_test_step2.yaml", handlers.step2)
	require.NoError(t, err)

	// Load BPMN workflow
	b, err := os.ReadFile("../../../testdata/message-workflow.bpmn")
	require.NoError(t, err)
	_, err = cl.LoadBPMNWorkflowFromBytes(ctx, "TestMessaging", b)
	require.NoError(t, err)

	// try to load another bpmn with a message of the same name, should fail
	b, err = os.ReadFile("../../../testdata/message-workflow-duplicate-message.bpmn")
	require.NoError(t, err)
	_, err = cl.LoadBPMNWorkflowFromBytes(ctx, "TestMessagingDupMessage", b)
	require.ErrorContains(t, err, "These messages already exist for other workflows:")

	tst.AssertCleanKV(ns, t, 60*time.Second)
}

func TestMessageNameGlobalUniquenessAcrossVersions(t *testing.T) {
	t.Parallel()
	ns := ksuid.New().String()
	ctx := context.Background()
	cl := client.New(client.WithEphemeralStorage(), client.WithConcurrency(10), client.WithNamespace(ns))
	err := cl.Dial(ctx, tst.NatsURL)
	require.NoError(t, err)

	messageEventHandlers := messageStartEventWorkflowEventHandler{
		completed: make(chan struct{}),
		t:         t,
	}

	//reg svc task
	err2 := taskutil.RegisterTaskYamlFile(ctx, cl, "messaging_test_simple_service_step.yaml", messageEventHandlers.simpleServiceTaskHandler)
	require.NoError(t, err2)

	err = cl.RegisterProcessComplete("Process_0w6dssp", messageEventHandlers.processEnd)
	require.NoError(t, err)

	//load bpmn
	b, err := os.ReadFile("../../../testdata/message-start-test.bpmn")
	require.NoError(t, err)
	_, err = cl.LoadBPMNWorkflowFromBytes(ctx, "TestMessageStartEvent", b)
	require.NoError(t, err)

	b, err = os.ReadFile("../../../testdata/message-start-test-v2.bpmn")
	require.NoError(t, err)
	_, err = cl.LoadBPMNWorkflowFromBytes(ctx, "TestMessageStartEvent", b)
	require.NoError(t, err)
}

func TestMessageStartEvent(t *testing.T) {
	t.Parallel()
	ns := ksuid.New().String()
	ctx := context.Background()
	cl := client.New(client.WithEphemeralStorage(), client.WithConcurrency(10), client.WithNamespace(ns))
	err := cl.Dial(ctx, tst.NatsURL)
	require.NoError(t, err)

	messageEventHandlers := messageStartEventWorkflowEventHandler{
		completed: make(chan struct{}),
		t:         t,
	}

	//reg svc task
	err2 := taskutil.RegisterTaskYamlFile(ctx, cl, "messaging_test_simple_service_step.yaml", messageEventHandlers.simpleServiceTaskHandler)
	require.NoError(t, err2)

	err = cl.RegisterProcessComplete("Process_0w6dssp", messageEventHandlers.processEnd)
	require.NoError(t, err)

	//load bpmn
	b, err := os.ReadFile("../../../testdata/message-start-test.bpmn")
	require.NoError(t, err)
	_, err = cl.LoadBPMNWorkflowFromBytes(ctx, "TestMessageStartEvent", b)
	require.NoError(t, err)

	//send message
	err2 = cl.SendMessage(ctx, "startDemoMsg", "", model.Vars{"customerID": 333})
	require.NoError(t, err2)

	//listen for events from shar svr
	go func() {
		err := cl.Listen(ctx)
		require.NoError(t, err)
	}()

	//wait for completion
	support.WaitForChan(t, messageEventHandlers.completed, time.Second*10)

	//assert empty KV
	tst.AssertCleanKV(ns, t, 60*time.Second)
}

type testMessagingHandlerDef struct {
	wg       sync.WaitGroup
	tst      *support.Integration
	finished chan struct{}
	t        *testing.T
}

func (x *testMessagingHandlerDef) step1(ctx context.Context, client client.JobClient, _ model.Vars) (model.Vars, error) {
	if err := client.Log(ctx, slog.LevelInfo, "Step 1", nil); err != nil {
		return nil, fmt.Errorf("log: %w", err)
	}
	if err := client.Log(ctx, slog.LevelInfo, "A sample client log", map[string]string{"funFactor": "100"}); err != nil {
		return nil, fmt.Errorf("log: %w", err)
	}
	return model.Vars{}, nil
}

func (x *testMessagingHandlerDef) step2(ctx context.Context, client client.JobClient, vars model.Vars) (model.Vars, error) {
	if err := client.Log(ctx, slog.LevelInfo, "Step 2", nil); err != nil {
		return nil, fmt.Errorf("log: %w", err)
	}
	x.tst.Mx.Lock()
	x.tst.FinalVars = vars
	x.tst.Mx.Unlock()
	return model.Vars{}, nil
}

func (x *testMessagingHandlerDef) sendMessage(ctx context.Context, client client.MessageClient, vars model.Vars) error {
	if err := client.Log(ctx, slog.LevelInfo, "Sending Message...", nil); err != nil {
		return fmt.Errorf("log: %w", err)
	}
	if err := client.Log(ctx, slog.LevelInfo, "A sample messaging log", map[string]string{"funFactor": "100"}); err != nil {
		return fmt.Errorf("log err: %w", err)
	}
	if err := client.SendMessage(ctx, "continueMessage", 57, model.Vars{"carried": vars["carried"]}); err != nil {
		return fmt.Errorf("send continue message: %w", err)
	}
	return nil
}

func (x *testMessagingHandlerDef) processEnd(ctx context.Context, vars model.Vars, wfError *model.Error, state model.CancellationState) {

	assert.Equal(x.t, "carried1value", vars["carried"])
	assert.Equal(x.t, "carried2value", vars["carried2"])
	close(x.finished)
}

type messageStartEventWorkflowEventHandler struct {
	completed chan struct{}
	t         *testing.T
}

func (mse *messageStartEventWorkflowEventHandler) simpleServiceTaskHandler(ctx context.Context, client client.JobClient, vars model.Vars) (model.Vars, error) {
	if err := client.Log(ctx, slog.LevelInfo, "simpleServiceTaskHandler", nil); err != nil {
		return nil, fmt.Errorf("failed logging: %w", err)
	}
	actualCustomerId := vars["customerID"]
	assert.Equal(mse.t, 333, actualCustomerId)

	return vars, nil
}

func (mse *messageStartEventWorkflowEventHandler) processEnd(_ context.Context, vars model.Vars, _ *model.Error, _ model.CancellationState) {
	assert.Equal(mse.t, 333, vars["customerID"])
	close(mse.completed)
}
