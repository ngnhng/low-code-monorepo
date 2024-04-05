package simple

import (
	"context"
	"fmt"
	"github.com/segmentio/ksuid"
	"github.com/stretchr/testify/assert"
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
	"gitlab.com/shar-workflow/shar/client"
	"gitlab.com/shar-workflow/shar/client/taskutil"
	support "gitlab.com/shar-workflow/shar/integration-support"
	"gitlab.com/shar-workflow/shar/model"
)

func TestSimpleRetry_ThrowWorkflowError(t *testing.T) {
	t.Parallel()
	// Create a starting context
	ctx := context.Background()

	ns := ksuid.New().String()
	// Dial shar
	cl := client.New(client.WithEphemeralStorage(), client.WithConcurrency(10), client.WithNamespace(ns))
	err := cl.Dial(ctx, tst.NatsURL)
	require.NoError(t, err)

	// Register a service task
	d := &testSimpleRetryThrowWorkflowErrorHandlerDef{t: t, finished: make(chan struct{})}
	err = taskutil.RegisterTaskYamlFile(ctx, cl, "simple_retry_ThrowWorkflowError.yaml", d.integrationSimple)
	require.NoError(t, err)
	err = taskutil.RegisterTaskYamlFile(ctx, cl, "simple_retry_ThrowWorkflowErrorHandle.yaml", d.integrationError)
	require.NoError(t, err)
	err = cl.RegisterProcessComplete("SimpleProcess", d.processEnd)
	require.NoError(t, err)

	// Load BPMN workflow
	b, err := os.ReadFile("../../../testdata/simple-error-workflow.bpmn")
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
	support.WaitForChan(t, d.finished, 20*time.Second)
	tst.AssertCleanKV(ns, t, 60*time.Second)
}

type testSimpleRetryThrowWorkflowErrorHandlerDef struct {
	t        *testing.T
	finished chan struct{}
}

func (d *testSimpleRetryThrowWorkflowErrorHandlerDef) integrationSimple(_ context.Context, _ client.JobClient, vars model.Vars) (model.Vars, error) {
	return nil, fmt.Errorf("deliberate test fail")
}

func (d *testSimpleRetryThrowWorkflowErrorHandlerDef) integrationError(_ context.Context, _ client.JobClient, vars model.Vars) (model.Vars, error) {
	vars["processVar"] = 69

	return vars, nil
}

func (d *testSimpleRetryThrowWorkflowErrorHandlerDef) processEnd(ctx context.Context, vars model.Vars, wfError *model.Error, state model.CancellationState) {
	assert.Equal(d.t, model.CancellationState_completed, state)
	assert.Equal(d.t, vars["processVar"], 69)
	close(d.finished)
}
