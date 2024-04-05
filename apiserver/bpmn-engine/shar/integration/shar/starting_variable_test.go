package intTest

import (
	"context"
	"fmt"
	"github.com/segmentio/ksuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gitlab.com/shar-workflow/shar/client"
	"gitlab.com/shar-workflow/shar/client/taskutil"
	"gitlab.com/shar-workflow/shar/model"
	"os"
	"testing"
	"time"
)

func TestStartingVariable(t *testing.T) {
	t.Parallel()

	// Create a starting context
	ctx := context.Background()

	// Dial shar
	ns := ksuid.New().String()
	cl := client.New(client.WithEphemeralStorage(), client.WithConcurrency(10), client.WithNamespace(ns))
	err := cl.Dial(ctx, tst.NatsURL)
	require.NoError(t, err)

	d := &testStartingVariableHandlerDef{finished: make(chan struct{})}

	// Register a service task
	err = taskutil.RegisterTaskYamlFile(ctx, cl, "starting_variable_test_DummyTask.yaml", d.integrationSimple)
	require.NoError(t, err)

	err = cl.RegisterProcessComplete("", d.processEnd)
	require.NoError(t, err)

	// Load BPMN workflow
	b, err := os.ReadFile("../../testdata/bad/expects-starting-variable.bpmn")
	require.NoError(t, err)
	_, err = cl.LoadBPMNWorkflowFromBytes(ctx, "SimpleWorkflowTest", b)
	require.NoError(t, err)

	// Launch the workflow
	_, _, err = cl.LaunchProcess(ctx, "SimpleWorkflowTest", model.Vars{})

	assert.Error(t, err)
	tst.AssertCleanKV(ns, t, 60*time.Second)
}

type testStartingVariableHandlerDef struct {
	finished chan struct{}
}

func (d *testStartingVariableHandlerDef) integrationSimple(_ context.Context, _ client.JobClient, vars model.Vars) (model.Vars, error) {
	fmt.Println("Hi")
	fmt.Println("carried", vars["carried"])
	return vars, nil
}

func (d *testStartingVariableHandlerDef) processEnd(ctx context.Context, vars model.Vars, wfError *model.Error, state model.CancellationState) {
	close(d.finished)
}
