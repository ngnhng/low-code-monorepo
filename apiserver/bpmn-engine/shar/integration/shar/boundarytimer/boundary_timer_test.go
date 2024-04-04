package boundarytimer

import (
	"context"
	"fmt"
	"github.com/segmentio/ksuid"
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

var testBoundaryTimerTimeout = 60 * time.Second

func TestBoundaryTimer(t *testing.T) {
	t.Parallel()
	d := &testBoundaryTimerDef{
		tst:      tst,
		finished: make(chan struct{}),
	}

	ns := ksuid.New().String()
	executeBoundaryTimerTest(t, d, ns)
	support.WaitForChan(t, d.finished, testBoundaryTimerTimeout)
	fmt.Println("CanTimeOut Called:", d.CanTimeOutCalled)
	fmt.Println("NoTimeout Called:", d.NoTimeoutCalled)
	fmt.Println("TimedOut Called:", d.TimedOutCalled)
	fmt.Println("CheckResult Called:", d.CheckResultCalled)
	tst.AssertCleanKV(ns, t, 60*time.Second)
}

func TestBoundaryTimerTimeout(t *testing.T) {
	t.Parallel()
	d := &testBoundaryTimerDef{
		CanTimeOutPause:  time.Second * 5,
		CheckResultPause: time.Second * 4,
		tst:              tst,
		finished:         make(chan struct{}),
	}

	ns := ksuid.New().String()
	executeBoundaryTimerTest(t, d, ns)
	support.WaitForChan(t, d.finished, testBoundaryTimerTimeout)
	fmt.Println("CanTimeOut Called:", d.CanTimeOutCalled)
	fmt.Println("NoTimeout Called:", d.NoTimeoutCalled)
	fmt.Println("TimedOut Called:", d.TimedOutCalled)
	fmt.Println("CheckResult Called:", d.CheckResultCalled)
	tst.AssertCleanKV(ns, t, 60*time.Second)
}

func TestExclusiveGateway(t *testing.T) {
	t.Parallel()
	d := &testBoundaryTimerDef{
		CheckResultPause: time.Second * 3,
		tst:              tst,
		finished:         make(chan struct{}),
	}

	ns := ksuid.New().String()
	executeBoundaryTimerTest(t, d, ns)
	support.WaitForChan(t, d.finished, testBoundaryTimerTimeout)
	fmt.Println("CanTimeOut Called:", d.CanTimeOutCalled)
	fmt.Println("NoTimeout Called:", d.NoTimeoutCalled)
	fmt.Println("TimedOut Called:", d.TimedOutCalled)
	fmt.Println("CheckResult Called:", d.CheckResultCalled)
	tst.AssertCleanKV(ns, t, 60*time.Second)
}

func executeBoundaryTimerTest(t *testing.T, d *testBoundaryTimerDef, ns string) string {
	// Create a starting context
	ctx := context.Background()

	// Dial shar
	cl := client.New(client.WithEphemeralStorage(), client.WithConcurrency(10), client.WithNamespace(ns))
	err := cl.Dial(ctx, d.tst.NatsURL)
	require.NoError(t, err)

	// Register service tasks
	err = taskutil.RegisterTaskYamlFile(ctx, cl, "boundary_timer_header_test_CanTimeout.yaml", d.canTimeout)
	require.NoError(t, err)
	err = taskutil.RegisterTaskYamlFile(ctx, cl, "boundary_timer_header_test_TimedOut.yaml", d.timedOut)
	require.NoError(t, err)
	err = taskutil.RegisterTaskYamlFile(ctx, cl, "boundary_timer_header_test_CheckResult.yaml", d.checkResult)
	require.NoError(t, err)
	err = taskutil.RegisterTaskYamlFile(ctx, cl, "boundary_timer_header_test_NoTimeout.yaml", d.noTimeout)
	require.NoError(t, err)

	// Load BPMN workflow
	b, err := os.ReadFile("../../../testdata/possible-timeout-workflow.bpmn")
	require.NoError(t, err)

	_, err = cl.LoadBPMNWorkflowFromBytes(ctx, "PossibleTimeout", b)
	require.NoError(t, err)

	err = cl.RegisterProcessComplete("Process_16piog5", d.processEnd)
	require.NoError(t, err)
	// Launch the workflow
	wfiID, _, err := cl.LaunchProcess(ctx, "Process_16piog5", model.Vars{})
	require.NoError(t, err)
	// Listen for service tasks
	go func() {
		err := cl.Listen(ctx)
		require.NoError(t, err)
	}()
	return wfiID
}

type testBoundaryTimerDef struct {
	mx                sync.Mutex
	CheckResultCalled int
	CanTimeOutCalled  int
	TimedOutCalled    int
	NoTimeoutCalled   int
	CanTimeOutPause   time.Duration
	CheckResultPause  time.Duration
	NoTimeoutPause    time.Duration
	tst               *support.Integration
	finished          chan struct{}
}

func (d *testBoundaryTimerDef) canTimeout(_ context.Context, _ client.JobClient, vars model.Vars) (model.Vars, error) {
	d.mx.Lock()
	d.CanTimeOutCalled++
	d.mx.Unlock()
	time.Sleep(d.CanTimeOutPause)
	return vars, nil
}

func (d *testBoundaryTimerDef) noTimeout(_ context.Context, _ client.JobClient, vars model.Vars) (model.Vars, error) {
	d.mx.Lock()
	d.NoTimeoutCalled++
	d.mx.Unlock()
	time.Sleep(d.NoTimeoutPause)
	return vars, nil
}

func (d *testBoundaryTimerDef) timedOut(_ context.Context, _ client.JobClient, vars model.Vars) (model.Vars, error) {
	d.mx.Lock()
	d.TimedOutCalled++
	d.mx.Unlock()
	return vars, nil
}

func (d *testBoundaryTimerDef) checkResult(_ context.Context, _ client.JobClient, vars model.Vars) (model.Vars, error) {
	d.mx.Lock()
	d.CheckResultCalled++
	d.mx.Unlock()
	time.Sleep(d.CheckResultPause)
	return vars, nil
}

func (d *testBoundaryTimerDef) processEnd(ctx context.Context, vars model.Vars, wfError *model.Error, state model.CancellationState) {
	d.finished <- struct{}{}
}
