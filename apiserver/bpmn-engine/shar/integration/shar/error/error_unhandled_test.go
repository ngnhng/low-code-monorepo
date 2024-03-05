package error

import (
	"context"
	"fmt"
	"github.com/segmentio/ksuid"
	"github.com/stretchr/testify/require"
	"gitlab.com/shar-workflow/shar/client"
	"gitlab.com/shar-workflow/shar/client/taskutil"
	"gitlab.com/shar-workflow/shar/common/workflow"
	support "gitlab.com/shar-workflow/shar/integration-support"
	"gitlab.com/shar-workflow/shar/model"
	"os"
	"testing"
	"time"
)

func TestUnhandledError(t *testing.T) {
	t.Parallel()

	// Create a starting context
	ctx := context.Background()

	// Dial shar
	ns := ksuid.New().String()
	cl := client.New(client.WithEphemeralStorage(), client.WithConcurrency(10), client.WithNamespace(ns))
	if err := cl.Dial(ctx, tst.NatsURL); err != nil {
		panic(err)
	}

	d := &testErrorUnhandledHandlerDef{finished: make(chan struct{})}

	// Register service tasks
	err := taskutil.RegisterTaskYamlFile(ctx, cl, "error_handled_test_couldThrowError.yaml", d.mayFail)
	require.NoError(t, err)
	err = taskutil.RegisterTaskYamlFile(ctx, cl, "error_handled_test_fixSituation.yaml", d.fixSituation)
	require.NoError(t, err)

	// Load BPMN workflow
	b, err := os.ReadFile("../../../testdata/errors.bpmn")
	if err != nil {
		panic(err)
	}
	if _, err := cl.LoadBPMNWorkflowFromBytes(ctx, "TestUnhandledError", b); err != nil {
		panic(err)
	}

	// A hook to watch for completion
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

type testErrorUnhandledHandlerDef struct {
	finished chan struct{}
}

// A "Hello World" service task
func (d *testErrorUnhandledHandlerDef) mayFail(_ context.Context, _ client.JobClient, _ model.Vars) (model.Vars, error) {
	fmt.Println("Throw unhandled error")
	return model.Vars{"success": false}, workflow.Error{Code: "102"}
}

// A "Hello World" service task
func (d *testErrorUnhandledHandlerDef) fixSituation(_ context.Context, _ client.JobClient, vars model.Vars) (model.Vars, error) {
	fmt.Println("Fixing")
	fmt.Println("carried", vars["carried"])
	return model.Vars{}, nil
}

func (d *testErrorUnhandledHandlerDef) processEnd(ctx context.Context, vars model.Vars, wfError *model.Error, state model.CancellationState) {
	close(d.finished)
}
