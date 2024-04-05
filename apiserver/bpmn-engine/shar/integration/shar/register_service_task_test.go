package intTest

import (
	"context"
	"fmt"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gitlab.com/shar-workflow/shar/client"
	"gitlab.com/shar-workflow/shar/client/taskutil"
	"gitlab.com/shar-workflow/shar/model"
	"testing"
)

func TestRegisterNil(t *testing.T) {

	// Create a starting context
	ctx := context.Background()

	// Dial shar
	cl := client.New(client.WithEphemeralStorage(), client.WithConcurrency(10))
	err := cl.Dial(ctx, tst.NatsURL)
	require.NoError(t, err)

	// Register a service task

	err = taskutil.RegisterTaskYamlFile(ctx, cl, "simple/simple_test.yaml", nil)
	assert.NoError(t, err)
}

func TestReinstatementOfOldServiceTaskVersion(t *testing.T) {
	// Create a starting context
	ctx := context.Background()

	// Dial shar
	cl := client.New(client.WithEphemeralStorage(), client.WithConcurrency(10))
	err := cl.Dial(ctx, tst.NatsURL)
	require.NoError(t, err)

	// Register a service task
	d := &testRegisterServiceTaskHandlerDef{}
	err = taskutil.RegisterTaskYamlFile(ctx, cl, "register_service_task_v0.1.yaml", d.regSvcTask)
	assert.NoError(t, err)

	// Register a change to a service task
	err = taskutil.RegisterTaskYamlFile(ctx, cl, "register_service_task_v0.2.yaml", d.regSvcTask)
	assert.NoError(t, err)

	cl.Shutdown()

	// ReDial shar so that we avoid the "task already registered msg"
	cl = client.New(client.WithEphemeralStorage(), client.WithConcurrency(10))
	err = cl.Dial(ctx, tst.NatsURL)
	require.NoError(t, err)

	// Register the original version of the service task
	err = taskutil.RegisterTaskYamlFile(ctx, cl, "register_service_task_v0.1.yaml", d.regSvcTask)
	assert.NoError(t, err)

	// assert that the original service task has been saved
	versionUids, err := cl.GetTaskSpecVersions(ctx, "RegSvcTask")
	assert.NoError(t, err)
	latestVersionUid := versionUids[len(versionUids)-1]

	latestTaskSpec, err := cl.GetTaskSpecByUID(ctx, latestVersionUid)
	assert.NoError(t, err)

	assert.Equal(t, "0.1", latestTaskSpec.Metadata.Version)
}

type testRegisterServiceTaskHandlerDef struct {
}

func (d *testRegisterServiceTaskHandlerDef) regSvcTask(_ context.Context, _ client.JobClient, vars model.Vars) (model.Vars, error) {
	fmt.Println("Hi")
	vars["Success"] = true
	return vars, nil
}
