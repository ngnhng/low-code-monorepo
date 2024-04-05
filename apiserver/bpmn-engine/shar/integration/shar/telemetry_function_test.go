package intTest

/* temporarily removed until NATS fixes memorystore support for stream sourcing

func _TestTelemetryStream(t *testing.T) {
	tst := &support.Integration{}
	tst.WithTrace = true
	tst.Setup(t, nil, nil)
	defer tst.Teardown()

	// Create a starting context
	ctx := context.Background()

	nc, err := tst.GetNats()
	require.NoError(t, err)
	js, err := tst.GetJetstream()
	require.NoError(t, err)

	err = setup.Nats(ctx, nc, js, nats.MemoryStorage, storage.NatsConfig, true)
	require.NoError(t, err)
	err = setup.Nats(ctx, nc, js, nats.MemoryStorage, server.NatsConfig, true)
	require.NoError(t, err)

	// Dial shar
	cl := client.New(client.WithEphemeralStorage(), client.WithConcurrency(10))
	err = cl.Dial(ctx, tst.NatsURL)
	require.NoError(t, err)
	defer cl.Shutdown()

	// Register a service task
	d := &testTelemetryStreamDef{t: t, finished: make(chan struct{})}

	err = taskutil.RegisterTaskYamlFile(ctx, cl, "simple_test.yaml", d.integrationSimple)
	require.NoError(t, err)
	err = cl.RegisterProcessComplete("SimpleProcess", d.processEnd)
	require.NoError(t, err)

	// Load BPMN workflow
	b, err := os.ReadFile("../../testdata/simple-workflow.bpmn")
	require.NoError(t, err)

	sub, err := js.Subscribe("WORKFLOW_TELEMETRY.>", func(msg *nats.Msg) {
		if err := msg.Ack(); err != nil {
			panic("couldn't ack message: " + err.Error())
		}
	}, nats.BindStream("WORKFLOW_TELEMETRY"))

	require.NoError(t, err)
	defer func() {
		if err := sub.Drain(); err != nil {
			panic("couldn't drain: " + err.Error())
		}
	}()

	_, err = cl.LoadBPMNWorkflowFromBytes(ctx, "SimpleWorkflowTest", b)
	require.NoError(t, err)

	// Launch the workflow
	_, _, err = cl.LaunchProcess(ctx, "SimpleProcess", model.Vars{})
	require.NoError(t, err)

	// Listen for service tasks
	go func() {
		err := cl.Listen(ctx)
		require.NoError(t, err)
	}()
	support.WaitForChan(t, d.finished, 20*time.Second)
	tst.AssertCleanKV()
}

type testTelemetryStreamDef struct {
	t        *testing.T
	finished chan struct{}
}

func (d *testTelemetryStreamDef) integrationSimple(ctx context.Context, client client.JobClient, vars model.Vars) (model.Vars, error) {
	fmt.Println("Hi")
	if err := client.Log(ctx, slog.LevelInfo, "Info message logged from client: integration simple", map[string]string{"value1": "good"}); err != nil {
		return nil, fmt.Errorf("log: %w", err)
	}
	assert.Equal(d.t, 32768, vars["carried"].(int))
	assert.Equal(d.t, 42, vars["localVar"].(int))
	vars["Success"] = true
	return vars, nil
}

func (d *testTelemetryStreamDef) processEnd(ctx context.Context, vars model.Vars, wfError *model.Error, state model.CancellationState) {
	close(d.finished)
}
*/
