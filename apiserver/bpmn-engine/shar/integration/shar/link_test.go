package intTest

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
	"sync"
	"testing"
	"time"
)

func TestLink(t *testing.T) {
	t.Parallel()

	// Create a starting context
	ctx := context.Background()

	// Dial shar
	ns := ksuid.New().String()
	cl := client.New(client.WithEphemeralStorage(), client.WithConcurrency(10), client.WithNamespace(ns))
	err := cl.Dial(ctx, tst.NatsURL)
	require.NoError(t, err)

	d := &testLinkHandlerDef{t: t, finished: make(chan struct{})}

	// Register service tasks
	err = taskutil.RegisterTaskYamlFile(ctx, cl, "link_test_spillage.yaml", d.spillage)
	require.NoError(t, err)
	err = taskutil.RegisterTaskYamlFile(ctx, cl, "link_test_dontCry.yaml", d.dontCry)
	require.NoError(t, err)
	err = taskutil.RegisterTaskYamlFile(ctx, cl, "link_test_cry.yaml", d.cry)
	require.NoError(t, err)
	err = taskutil.RegisterTaskYamlFile(ctx, cl, "link_test_wipeItUp.yaml", d.wipeItUp)
	require.NoError(t, err)

	// Load BPMN workflow
	b, err := os.ReadFile("../../testdata/link.bpmn")
	require.NoError(t, err)
	_, err = cl.LoadBPMNWorkflowFromBytes(ctx, "LinkTest", b)
	require.NoError(t, err)

	err = cl.RegisterProcessComplete("Process_0e9etnb", d.processEnd)
	require.NoError(t, err)

	// Launch the workflow
	_, _, err = cl.LaunchProcess(ctx, "Process_0e9etnb", model.Vars{})
	require.NoError(t, err)
	// Listen for service tasks
	go func() {
		err := cl.Listen(ctx)
		require.NoError(t, err)
	}()
	support.WaitForChan(t, d.finished, 20*time.Second)
	assert.True(t, d.hitEnd)
	assert.True(t, d.hitResponse)
	tst.AssertCleanKV(ns, t, 60*time.Second)
}

type testLinkHandlerDef struct {
	t           *testing.T
	mx          sync.Mutex
	hitEnd      bool
	hitResponse bool
	finished    chan struct{}
}

func (d *testLinkHandlerDef) spillage(_ context.Context, _ client.JobClient, vars model.Vars) (model.Vars, error) {
	fmt.Println("Spilled")
	vars["substance"] = "beer"
	return vars, nil
}

func (d *testLinkHandlerDef) dontCry(_ context.Context, _ client.JobClient, vars model.Vars) (model.Vars, error) {
	fmt.Println("No tears shed")
	d.mx.Lock()
	defer d.mx.Unlock()
	d.hitResponse = true
	return vars, nil
}

func (d *testLinkHandlerDef) cry(_ context.Context, _ client.JobClient, vars model.Vars) (model.Vars, error) {
	fmt.Println("*sob*")
	d.mx.Lock()
	defer d.mx.Unlock()
	d.hitResponse = true
	return vars, nil
}

func (d *testLinkHandlerDef) wipeItUp(_ context.Context, _ client.JobClient, vars model.Vars) (model.Vars, error) {
	fmt.Println("all mopped up")
	d.mx.Lock()
	defer d.mx.Unlock()
	d.hitEnd = true
	return vars, nil
}

func (d *testLinkHandlerDef) processEnd(ctx context.Context, vars model.Vars, wfError *model.Error, state model.CancellationState) {
	close(d.finished)
}
