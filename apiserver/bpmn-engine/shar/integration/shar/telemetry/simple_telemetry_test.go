package telemetry

import (
	"context"
	"gitlab.com/shar-workflow/shar/common/namespace"
	"go.opentelemetry.io/otel/exporters/stdout/stdouttrace"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	"go.opentelemetry.io/otel/trace"
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gitlab.com/shar-workflow/shar/client"
	"gitlab.com/shar-workflow/shar/client/taskutil"
	support "gitlab.com/shar-workflow/shar/integration-support"
	"gitlab.com/shar-workflow/shar/model"
)

// TestSimpleTelemetry is a test function that demonstrates the usage of simple telemetry.
func TestSimpleTelemetry(t *testing.T) {
	tst := &support.Integration{}
	tst.WithTrace = false

	exporter, err := stdouttrace.New(stdouttrace.WithPrettyPrint())
	require.NoError(t, err, "failed to create stdouttrace exporter")
	batchSpanProcessor := sdktrace.NewBatchSpanProcessor(exporter)
	traceProvider := sdktrace.NewTracerProvider(
		sdktrace.WithSampler(sdktrace.AlwaysSample()),
		sdktrace.WithSpanProcessor(batchSpanProcessor),
	)

	tst.Setup()
	defer tst.Teardown()

	// Create a starting context
	ctx := context.Background()

	// Dial shar
	cl := client.New(client.WithEphemeralStorage(), client.WithConcurrency(10), client.WithOpenTelemetry()) //client.Experimental_WithNamespace("fooNS"),

	err = cl.Dial(ctx, tst.NatsURL)
	require.NoError(t, err)

	// Register a service task
	ctx, span := traceProvider.Tracer("client-trace").Start(ctx, "client-span")
	defer span.End()
	sctx := trace.SpanContextFromContext(ctx)

	d := &testSimpleTelemetryHandlerDef{
		t:             t,
		finished:      make(chan struct{}),
		originalSpan:  sctx.SpanID(),
		originalTrace: sctx.TraceID(),
	}

	err = taskutil.RegisterTaskYamlFile(ctx, cl, "simple_test.yaml", d.integrationSimple)
	require.NoError(t, err)
	err = cl.RegisterProcessComplete("SimpleProcess", d.processEnd)
	require.NoError(t, err)

	// Load BPMN workflow
	b, err := os.ReadFile("../../../testdata/simple-workflow.bpmn")
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

	tst.AssertCleanKV(namespace.Default, t, 120)
}

type testSimpleTelemetryHandlerDef struct {
	t             *testing.T
	finished      chan struct{}
	originalSpan  trace.SpanID
	originalTrace trace.TraceID
}

func (d *testSimpleTelemetryHandlerDef) integrationSimple(ctx context.Context, _ client.JobClient, vars model.Vars) (model.Vars, error) {
	sctx := trace.SpanContextFromContext(ctx)
	assert.Equal(d.t, d.originalTrace.String(), sctx.TraceID().String())
	assert.NotEqual(d.t, d.originalSpan.String(), sctx.SpanID().String())
	assert.Equal(d.t, 32768, vars["carried"].(int))
	assert.Equal(d.t, 42, vars["localVar"].(int))
	vars["Success"] = true
	return vars, nil
}

func (d *testSimpleTelemetryHandlerDef) processEnd(ctx context.Context, vars model.Vars, wfError *model.Error, state model.CancellationState) {
	sctx := trace.SpanContextFromContext(ctx)
	assert.Equal(d.t, d.originalTrace.String(), sctx.TraceID().String())
	assert.NotEqual(d.t, d.originalSpan.String(), sctx.SpanID().String())
	close(d.finished)
}
