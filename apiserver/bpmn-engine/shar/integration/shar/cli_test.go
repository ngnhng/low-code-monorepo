package intTest

/*
import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gitlab.com/shar-workflow/shar/cli/commands"
	"gitlab.com/shar-workflow/shar/cli/flag"
	"gitlab.com/shar-workflow/shar/cli/output"
	"gitlab.com/shar-workflow/shar/client"
	support "gitlab.com/shar-workflow/shar/integration-support"
	"gitlab.com/shar-workflow/shar/model"
	"strings"
	"testing"
	"time"
)

func TestCLI(t *testing.T) {
	tst := &support.Integration{}
	tst.Setup(t, nil, nil)
	defer tst.Teardown()

	// Create a starting context
	ctx := context.Background()

	// Dial shar
	cl := client.New(client.WithEphemeralStorage(), client.WithConcurrency(10))
	err := cl.Dial(ctx, tst.NatsURL)
	require.NoError(t, err)

	d := &testLaunchWorkflow{t: t, allowContinue: make(chan interface{}), finished: make(chan struct{})}

	// Register a service task
	err = cl.RegisterProcessComplete("SimpleProcess", d.processEnd)
	require.NoError(t, err)
	err = cl.RegisterServiceTask(ctx, "SimpleProcess", d.integrationSimple)
	require.NoError(t, err)

	time.Sleep(1 * time.Second)

	flag.Value.Server = tst.NatsURL
	flag.Value.Json = true

	// Load Workflow
	wf := &struct {
		WorkflowID string
	}{}
	sharExecf(t, wf, "bpmn load SimpleWorkflow ../../testdata/simple-workflow.bpmn --server %s --json", tst.NatsURL)
	assert.NotEmpty(t, wf.WorkflowID)

	// Listen for service tasks
	go func() {
		err := cl.Listen(ctx)
		require.NoError(t, err)
	}()

	js, err := tst.GetJetstream()
	require.NoError(t, err)
	l := js.Consumers("WORKFLOW")
	for i := range l {
		fmt.Println(i.Name)
	}
	// List Workflows
	wfs := &struct {
		Workflow []*model.ListWorkflowResponse
	}{}
	sharExecf(t, wfs, "workflow list --server %s --json", tst.NatsURL)
	assert.Equal(t, 1, len(wfs.Workflow))
	assert.Equal(t, "SimpleWorkflow", wfs.Workflow[0].Name)
	assert.Equal(t, int32(1), wfs.Workflow[0].Version)

	// Start Workflow
	wfi := &struct {
		ExecutionID string
	}{}
	sharExecf(t, wfi, "workflow start SimpleWorkflow --server %s --json", tst.NatsURL)
	assert.NotEmpty(t, wfi.ExecutionID)

	// Get Workflow Instances
	instances := &struct {
		Execution []model.ListWorkflowInstanceResult
	}{}
	sharExecf(t, &instances, "instance list SimpleWorkflow --server %s --json", tst.NatsURL)
	assert.Equal(t, 1, len(instances.Execution))
	assert.Equal(t, wfi.ExecutionID, instances.Execution[0].Id)

	//TODO:RE-implement
	/*
		//Get Workflow Instance Status
		status := &struct {
			TrackingId string
			ID         string
			Type       string
			State      string
			Executing  string
			Since      int64
		}{}
		sharExecf(t, &status, "instance status %s --server %s --json", wfi.ExecutionID, tst.NatsURL)
		assert.NotEmpty(t, status.TrackingId)
		assert.Equal(t, "Step1", status.ID)
		assert.Equal(t, element.ServiceTask, status.Type)
		assert.Equal(t, "executing", status.State)
		assert.Equal(t, "SimpleProcess", status.Executing)
		assert.NotZero(t, status.Since)

	// Allow workflow to continue
	close(d.allowContinue)

	support.WaitForChan(t, d.finished, 20*time.Second)
	tst.AssertCleanKV()
}

func sharExecf[T any](t *testing.T, ret *T, command string, args ...any) {
	res := bytes.NewBuffer(make([]byte, 0))
	output.Stream = res
	commands.RootCmd.SetArgs(strings.Split(fmt.Sprintf(command, args...), " "))
	err := commands.RootCmd.Execute()
	require.NoError(t, err)
	err = json.Unmarshal(res.Bytes(), ret)
	require.NoError(t, err)
}

type testLaunchWorkflow struct {
	t             *testing.T
	allowContinue chan interface{}
	finished      chan struct{}
}

func (d *testLaunchWorkflow) integrationSimple(_ context.Context, _ client.JobClient, vars model.Vars) (model.Vars, error) {
	<-d.allowContinue
	assert.Equal(d.t, 32768, vars["carried"].(int))
	vars["Success"] = true
	return vars, nil
}

func (d *testLaunchWorkflow) processEnd(ctx context.Context, vars model.Vars, wfError *model.Error, state model.CancellationState) {
	close(d.finished)
}
*/
