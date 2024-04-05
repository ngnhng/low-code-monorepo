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
	"os"
	"strconv"
	"sync"
	"testing"
	"time"
)

//goland:noinspection GoNilness
func TestConcurrentMessaging2(t *testing.T) {
	t.Parallel()

	handlers := &testConcurrentMessaging2HandlerDef{finished: make(chan struct{}), test: t}
	// Create a starting context
	ctx := context.Background()

	ns := ksuid.New().String()
	// Dial shar
	cl := client.New(client.WithEphemeralStorage(), client.WithConcurrency(10), client.WithNamespace(ns))
	err := cl.Dial(ctx, tst.NatsURL)
	require.NoError(t, err)

	// Register service tasks
	err = taskutil.RegisterTaskYamlFile(ctx, cl, "concurrent_messaging_2_test_step1.yaml", handlers.step1)
	require.NoError(t, err)
	err = taskutil.RegisterTaskYamlFile(ctx, cl, "concurrent_messaging_2_test_step2.yaml", handlers.step2)
	require.NoError(t, err)

	// Load BPMN workflow
	b, err := os.ReadFile("../../../testdata/message-workflow-2.bpmn")
	require.NoError(t, err)

	_, err = cl.LoadBPMNWorkflowFromBytes(ctx, "TestConcurrentMessaging", b)
	require.NoError(t, err)

	err = cl.RegisterMessageSender(ctx, "TestConcurrentMessaging", "continueMessage", handlers.sendMessage)
	require.NoError(t, err)
	err = cl.RegisterProcessComplete("Process_03llwnm", handlers.processEnd)
	require.NoError(t, err)
	// Listen for service tasks
	go func() {
		err := cl.Listen(ctx)
		require.NoError(t, err)
	}()

	handlers.instComplete = make(map[string]struct{})
	n := 100
	tm := time.Now()
	for inst := 0; inst < n; inst++ {
		go func(inst int) {
			// Launch the workflow
			if _, _, err := cl.LaunchProcess(ctx, "Process_0hgpt6k", model.Vars{"orderId": inst}); err != nil {
				panic(err)
			} else {
				handlers.mx.Lock()
				handlers.instComplete[strconv.Itoa(inst)] = struct{}{}
				handlers.mx.Unlock()
			}
		}(inst)
	}

	support.WaitForExpectedCompletions(t, n, handlers.finished, time.Second*20)

	fmt.Println("Stopwatch:", -time.Until(tm))
	tst.AssertCleanKV(ns, t, 60*time.Second)
	assert.Equal(t, n, handlers.received)
	assert.Equal(t, 0, len(handlers.instComplete))
}

type testConcurrentMessaging2HandlerDef struct {
	mx           sync.Mutex
	test         *testing.T
	received     int
	finished     chan struct{}
	instComplete map[string]struct{}
}

func (x *testConcurrentMessaging2HandlerDef) step1(_ context.Context, _ client.JobClient, _ model.Vars) (model.Vars, error) {
	return model.Vars{}, nil
}

func (x *testConcurrentMessaging2HandlerDef) step2(_ context.Context, _ client.JobClient, vars model.Vars) (model.Vars, error) {
	assert.Equal(x.test, "carried1value", vars["carried"])
	assert.Equal(x.test, "carried2value", vars["carried2"])
	return model.Vars{}, nil
}

func (x *testConcurrentMessaging2HandlerDef) sendMessage(ctx context.Context, cmd client.MessageClient, vars model.Vars) error {
	if err := cmd.SendMessage(ctx, "continueMessage", vars["orderId"], model.Vars{"carried": vars["carried"]}); err != nil {
		return fmt.Errorf("send continue message: %w", err)
	}
	return nil
}

func (x *testConcurrentMessaging2HandlerDef) processEnd(ctx context.Context, vars model.Vars, wfError *model.Error, state model.CancellationState) {
	x.mx.Lock()
	if _, ok := x.instComplete[strconv.Itoa(vars["orderId"].(int))]; !ok {
		panic("too many calls")
	}
	delete(x.instComplete, strconv.Itoa(vars["orderId"].(int)))
	x.received++
	x.mx.Unlock()
	x.finished <- struct{}{}
}
