package intTest

/* temporarily removed until NATS fixes memorystore support for stream sourcing

func TestSimpleTelemetry(t *testing.T) {
	tel := &server.MockExporter{}
	tel.On("ExportSpans", mock.AnythingOfType("*context.valueCtx"), mock.AnythingOfType("[]trace.ReadOnlySpan")).
		Run(func(args mock.Arguments) {
			sp := args.Get(1).([]trace.ReadOnlySpan)
			slog.Debug(fmt.Sprintf("###%v", sp[0].Name()))
		}).Times(6).Return(nil)

	tst := &support.Integration{WithTelemetry: tel}
	tst.Setup(t, nil, nil)
	tst.WithTrace = true
	defer tst.Teardown()

	d := &testTelSimpleHandlerDef{t: t, finished: make(chan struct{})}

	// Create a starting context
	ctx := context.Background()

	// Dial shar
	cl := client.New(client.WithEphemeralStorage(), client.WithConcurrency(100))
	err := cl.Dial(ctx, tst.NatsURL)
	require.NoError(t, err)
	defer cl.Shutdown()

	// Register a service task
	err = taskutil.RegisterTaskYamlFile(ctx, cl, "telemetry_simple_test_SimpleProcess.yaml", d.integrationSimple)
	require.NoError(t, err)

	err = cl.RegisterProcessComplete("SimpleProcess", d.processEnd)
	require.NoError(t, err)

	// Load BPMN workflow
	b, err := os.ReadFile("../../testdata/simple-workflow.bpmn")
	require.NoError(t, err)
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
	tel.AssertExpectations(t)
	tst.AssertCleanKV()
}

type testTelSimpleHandlerDef struct {
	t        *testing.T
	finished chan struct{}
}

func (d *testTelSimpleHandlerDef) integrationSimple(_ context.Context, _ client.JobClient, vars model.Vars) (model.Vars, error) {
	fmt.Println("Hi")
	assert.Equal(d.t, 32768, vars["carried"].(int))
	vars["Success"] = true
	return vars, nil
}

func (d *testTelSimpleHandlerDef) processEnd(ctx context.Context, vars model.Vars, wfError *model.Error, state model.CancellationState) {
	close(d.finished)
}
*/
