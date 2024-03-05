package intTest

import (
	"context"
	"github.com/segmentio/ksuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gitlab.com/shar-workflow/shar/client"
	support "gitlab.com/shar-workflow/shar/integration-support"
	"gitlab.com/shar-workflow/shar/model"
	"os"
	"testing"
	"time"
)

func TestEmbargo(t *testing.T) {
	t.Parallel()
	ns := ksuid.New().String()

	// Create a starting context
	ctx := context.Background()

	// Dial shar
	cl := client.New(client.WithEphemeralStorage(), client.WithConcurrency(10), client.WithNamespace(ns))
	err := cl.Dial(ctx, tst.NatsURL)
	require.NoError(t, err)

	// Load BPMN workflow
	b, err := os.ReadFile("../../testdata/test-timer-parse-duration.bpmn")
	require.NoError(t, err)

	_, err = cl.LoadBPMNWorkflowFromBytes(ctx, "TestEmbargo", b)
	require.NoError(t, err)

	sw := time.Now().UnixNano()

	finished := make(chan struct{})
	err = cl.RegisterProcessComplete("Process_0cxoltv", func(ctx context.Context, vars model.Vars, wfError *model.Error, endState model.CancellationState) {
		close(finished)
	})
	require.NoError(t, err)
	// Launch the workflow
	_, _, err = cl.LaunchProcess(ctx, "Process_0cxoltv", model.Vars{})
	require.NoError(t, err)

	// Listen for service tasks
	go func() {
		err := cl.Listen(ctx)
		require.NoError(t, err)
	}()

	support.WaitForChan(t, finished, 20*time.Second)
	d := time.Duration(time.Now().UnixNano() - sw)
	assert.Equal(t, 2, int(d.Seconds()))
	tst.AssertCleanKV(ns, t, 60*time.Second)
}
