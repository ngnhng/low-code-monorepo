package gateway

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
	"testing"
	"time"
)

func TestExclusiveGatewayDefault(t *testing.T) {
	t.Parallel()

	// Create a starting context
	ctx := context.Background()

	// Dial shar
	ns := ksuid.New().String()
	cl := client.New(client.WithEphemeralStorage(), client.WithConcurrency(10), client.WithNamespace(ns))
	err := cl.Dial(ctx, tst.NatsURL)
	require.NoError(t, err)

	d := &testExclusiveGatewayDefaultDef{t: t, gameResult: "Win", finished: make(chan struct{})}

	// Register service tasks
	err = taskutil.RegisterTaskYamlFile(ctx, cl, "exclusive_gateway_default_Default.yaml", d.defaultOption)
	require.NoError(t, err)
	err = taskutil.RegisterTaskYamlFile(ctx, cl, "exclusive_gateway_default_Option1.yaml", d.option1)
	require.NoError(t, err)
	err = taskutil.RegisterTaskYamlFile(ctx, cl, "exclusive_gateway_default_Option2.yaml", d.option2)
	require.NoError(t, err)

	// Load BPMN workflow
	b, err := os.ReadFile("../../../testdata/exclusive-gateway-default.bpmn")
	require.NoError(t, err)
	_, err = cl.LoadBPMNWorkflowFromBytes(ctx, "ExclusiveGatewayDefaultTest", b)
	require.NoError(t, err)

	err = cl.RegisterProcessComplete("GatewayTest", d.processEnd)
	require.NoError(t, err)

	// Launch the workflow
	_, _, err = cl.LaunchProcess(ctx, "GatewayTest", model.Vars{"val1": 2})
	require.NoError(t, err)
	// Listen for service tasks
	go func() {
		err := cl.Listen(ctx)
		require.NoError(t, err)
	}()
	support.WaitForChan(t, d.finished, 20*time.Second)
	tst.AssertCleanKV(ns, t, 60*time.Second)
}

type testExclusiveGatewayDefaultDef struct {
	t          *testing.T
	gameResult string
	finished   chan struct{}
}

func (d *testExclusiveGatewayDefaultDef) defaultOption(_ context.Context, _ client.JobClient, vars model.Vars) (model.Vars, error) {
	fmt.Println("Default Triggered")
	return vars, nil
}

func (d *testExclusiveGatewayDefaultDef) option1(_ context.Context, _ client.JobClient, vars model.Vars) (model.Vars, error) {
	fmt.Println("Option 1")
	return vars, nil
}

func (d *testExclusiveGatewayDefaultDef) option2(_ context.Context, _ client.JobClient, vars model.Vars) (model.Vars, error) {
	fmt.Println("Option 2")
	return vars, nil
}

func (d *testExclusiveGatewayDefaultDef) processEnd(ctx context.Context, vars model.Vars, wfError *model.Error, state model.CancellationState) {
	close(d.finished)
}
