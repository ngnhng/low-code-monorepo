package intTest

import (
	"context"
	"fmt"
	"github.com/segmentio/ksuid"
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gitlab.com/shar-workflow/shar/client"
	"gitlab.com/shar-workflow/shar/client/taskutil"
	"gitlab.com/shar-workflow/shar/model"
)

func TestShutdownSimple(t *testing.T) {
	t.Parallel()

	// Create a starting context
	ctx := context.Background()

	// Dial shar
	ns := ksuid.New().String()
	cl := client.New(client.WithEphemeralStorage(), client.WithConcurrency(10), client.WithNamespace(ns))
	err := cl.Dial(ctx, tst.NatsURL)
	require.NoError(t, err)

	// Register a service task
	d := &testShutdownHandlerDef{t: t, finished: make(chan struct{})}

	err = taskutil.RegisterTaskYamlFile(ctx, cl, "simple/simple_test.yaml", d.integrationSimple)
	require.NoError(t, err)
	err = cl.RegisterProcessComplete("SimpleProcess", d.processEnd)
	require.NoError(t, err)

	// Load BPMN workflow
	b, err := os.ReadFile("../../testdata/simple-workflow.bpmn")
	require.NoError(t, err)

	_, err = cl.LoadBPMNWorkflowFromBytes(ctx, "SimpleWorkflowTest", b)
	require.NoError(t, err)

	// Launch the workflow
	_, _, err = cl.LaunchProcess(ctx, "SimpleProcess", model.Vars{})
	require.NoError(t, err)
	// Listen for service tasks
	go func() {
		err := cl.Listen(ctx)
		require.NoError(t, err)
	}()
	time.Sleep(1 * time.Second)
	stopwatch := time.Now()
	cl.Shutdown()
	assert.Greater(t, time.Since(stopwatch), time.Millisecond*2500)
	//support.WaitForChan(t, d.finished, 20*time.Second)
	tst.AssertCleanKV(ns, t, 60*time.Second)
}

type testShutdownHandlerDef struct {
	t        *testing.T
	finished chan struct{}
}

func (d *testShutdownHandlerDef) integrationSimple(_ context.Context, _ client.JobClient, vars model.Vars) (model.Vars, error) {
	fmt.Println("Hi")
	assert.Equal(d.t, 32768, vars["carried"].(int))
	assert.Equal(d.t, 42, vars["localVar"].(int))
	vars["Success"] = true
	time.Sleep(4 * time.Second)
	return vars, nil
}

func (d *testShutdownHandlerDef) processEnd(ctx context.Context, vars model.Vars, wfError *model.Error, state model.CancellationState) {
	close(d.finished)
}
