package error

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
	"testing"
	"time"
)

func TestEndEventError(t *testing.T) {
	t.Parallel()
	// Create a starting context
	ctx := context.Background()

	// Dial shar
	ns := ksuid.New().String()
	cl := client.New(client.WithNamespace(ns))
	if err := cl.Dial(ctx, tst.NatsURL); err != nil {
		panic(err)
	}

	d := &testErrorEndEventHandlerDef{finished: make(chan struct{}), t: t}

	// Register service tasks
	err := taskutil.RegisterTaskYamlFile(ctx, cl, "error_endevent_test_couldThrowError.yaml", d.mayFail3)
	require.NoError(t, err)
	err = taskutil.RegisterTaskYamlFile(ctx, cl, "error_endevent_test_fixSituation.yaml", d.fixSituation)
	require.NoError(t, err)

	// Load BPMN workflow
	b, err := os.ReadFile("../../../testdata/errors.bpmn")
	if err != nil {
		panic(err)
	}
	if _, err := cl.LoadBPMNWorkflowFromBytes(ctx, "TestEndEventError", b); err != nil {
		panic(err)
	}

	err = cl.RegisterProcessComplete("Process_07lm3kx", d.processEnd)
	require.NoError(t, err)
	// Launch the workflow
	_, _, err = cl.LaunchProcess(ctx, "Process_07lm3kx", model.Vars{})
	if err != nil {
		panic(err)
	}

	// Listen for service tasks
	go func() {
		err := cl.Listen(ctx)
		if err != nil {
			panic(err)
		}
	}()

	// wait for the workflow to complete
	support.WaitForChan(t, d.finished, 20*time.Second)
	tst.AssertCleanKV(ns, t, 60*time.Second)
}

type testErrorEndEventHandlerDef struct {
	finished chan struct{}
	t        *testing.T
}

// A "Hello World" service task
func (d *testErrorEndEventHandlerDef) mayFail3(ctx context.Context, client client.JobClient, _ model.Vars) (model.Vars, error) {
	if err := client.Log(ctx, slog.LevelInfo, "service task completed successfully", nil); err != nil {
		return nil, fmt.Errorf("logging failed: %w", err)
	}
	return model.Vars{"success": true}, nil
}

// A "Hello World" service task
func (d *testErrorEndEventHandlerDef) fixSituation(_ context.Context, _ client.JobClient, vars model.Vars) (model.Vars, error) {
	fmt.Println("carried", vars["carried"])
	panic("this event should not fire")
}
func (d *testErrorEndEventHandlerDef) processEnd(ctx context.Context, vars model.Vars, wfError *model.Error, state model.CancellationState) {
	assert.Equal(d.t, "103", wfError.Code)
	assert.Equal(d.t, "CatastrophicError", wfError.Name)
	assert.Equal(d.t, model.CancellationState_completed, state)
	close(d.finished)
}
