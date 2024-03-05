package intTest

import (
	"context"
	"fmt"
	"github.com/nats-io/nats.go"
	"github.com/segmentio/ksuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gitlab.com/shar-workflow/shar/client"
	"gitlab.com/shar-workflow/shar/client/taskutil"
	"gitlab.com/shar-workflow/shar/common/namespace"
	support "gitlab.com/shar-workflow/shar/integration-support"
	"gitlab.com/shar-workflow/shar/model"
	"gitlab.com/shar-workflow/shar/server/messages"
	"os"
	"testing"
)

func TestWfVersioning(t *testing.T) {
	tst := support.NewIntegrationT(t, nil, nil, false, func() (bool, string) {
		return !support.IsNatsPersist(), "only valid when NOT persisting to nats"
	}, nil)
	tst.Setup()
	defer tst.Teardown()

	// Create a starting context
	ctx := context.Background()

	// Dial shar
	ns := ksuid.New().String()
	cl := client.New(client.WithEphemeralStorage(), client.WithConcurrency(10), client.WithNamespace(ns))
	err := cl.Dial(ctx, tst.NatsURL)
	require.NoError(t, err)

	// Load service task
	d := &wfTeestandlerDef{t: t, finished: make(chan struct{})}
	err = taskutil.RegisterTaskYamlFile(ctx, cl, "wf_versioning_SimpleProcess.yaml", d.integrationSimple)
	require.NoError(t, err)

	// Load BPMN workflow
	b, err := os.ReadFile("../../testdata/simple-workflow.bpmn")
	require.NoError(t, err)
	_, err = cl.LoadBPMNWorkflowFromBytes(ctx, "SimpleWorkflowTest", b)
	require.NoError(t, err)

	res, err := cl.ListWorkflows(ctx)
	require.NoError(t, err)
	assert.Equal(t, int32(1), res[0].Version)
	oldWfId, err := cl.LoadBPMNWorkflowFromBytes(ctx, "SimpleWorkflowTest", b)
	require.NoError(t, err)
	res2, err := cl.ListWorkflows(ctx)
	require.NoError(t, err)
	assert.Equal(t, int32(1), res2[0].Version)
	nc, err := nats.Connect(tst.NatsURL)
	require.NoError(t, err)
	js, err := nc.JetStream()
	require.NoError(t, err)
	kv, err := js.KeyValue(namespace.PrefixWith(ns, messages.KvDefinition))
	require.NoError(t, err)
	keys, err := kv.Keys()
	require.NoError(t, err)
	assert.Equal(t, 1, len(keys))

	// Load changed BPMN workflow
	b, err = os.ReadFile("../../testdata/simple-workflow-changed.bpmn")
	require.NoError(t, err)
	newWfId, err := cl.LoadBPMNWorkflowFromBytes(ctx, "SimpleWorkflowTest", b)
	require.NoError(t, err)
	res3, err := cl.ListWorkflows(ctx)
	require.NoError(t, err)
	assert.Equal(t, int32(2), res3[0].Version)
	vers, err := cl.GetWorkflowVersions(ctx, "SimpleWorkflowTest")
	require.NoError(t, err)
	assert.Len(t, vers.Version, 2)
	assert.Equal(t, vers.Version[0].Number, int32(1))
	assert.Equal(t, vers.Version[1].Number, int32(2))
	assert.Equal(t, vers.Version[0].Id, oldWfId)
	assert.Equal(t, vers.Version[1].Id, newWfId)
	keys, err = kv.Keys()
	require.NoError(t, err)
	assert.Equal(t, 2, len(keys))
	tst.AssertCleanKV(ns, t, tst.Cooldown)
}

type wfTeestandlerDef struct {
	t        *testing.T
	finished chan struct{}
}

func (d *wfTeestandlerDef) integrationSimple(_ context.Context, _ client.JobClient, vars model.Vars) (model.Vars, error) {
	fmt.Println("Hi")
	assert.Equal(d.t, 32768, vars["carried"].(int))
	assert.Equal(d.t, 42, vars["localVar"].(int))
	vars["Success"] = true
	return vars, nil
}
