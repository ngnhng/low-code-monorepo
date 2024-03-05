package telemetry

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"gitlab.com/shar-workflow/shar/common/ctxkey"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/trace"
	"log/slog"
)

// SetTraceParentSpanID sets the span portion of a W3C traceparent and returns a new W3C traceparent
func SetTraceParentSpanID(traceparent string, spanID string) string {
	base := []rune(traceparent)
	copy(base[36:52], []rune(spanID))
	return string(base)
}

// GetTraceparentTraceAndSpan returns a trace and span from a W3C traceparent
func GetTraceparentTraceAndSpan(traceparent string) (string, string) {
	return traceparent[3:35], traceparent[36:52]
}

// TraceIDFromTraceparent extracts the trace ID from a W3C traceparent header and returns it as a trace.TraceID
func TraceIDFromTraceparent(traceparent string) (trace.TraceID, error) {
	traceID, err := trace.TraceIDFromHex(traceparent[3:35])
	if err != nil {
		return trace.TraceID{}, fmt.Errorf("trace id from hex: %w", err)
	}
	return traceID, nil
}

var emptySpan = [8]byte{}

// StartApiSpan starts a new API span with the provided tracer name and API name.
// It takes a context, tracer name, and API name as input parameters.
// The function extracts the trace and span IDs from the provided traceparent string.
// If the trace ID is invalid, it starts a new root span with the tracer name and API name using the OpenTelemetry Tracer Provider.
// If the span ID is empty, it starts a new root span and updates the traceparent string with the new span ID.
// Otherwise, it creates a new SpanContext with the extracted trace and span IDs and updates the context with the remote span context.
// Finally, it starts a new span with the updated context, tracer name, and API name using the OpenTelemetry Tracer Provider.
// The function returns the updated context and the started span.
func StartApiSpan(ctx context.Context, tracerName string, apiName string) (context.Context, trace.Span) {

	var traceIDhex, spanIDhex string
	traceParent := ctx.Value(ctxkey.Traceparent).(string)
	traceIDhex, spanIDhex = GetTraceparentTraceAndSpan(traceParent)
	traceID, err := trace.TraceIDFromHex(traceIDhex)
	if err != nil {
		return otel.GetTracerProvider().Tracer(tracerName).Start(ctx, apiName, trace.WithNewRoot())
	}
	spanID, err := trace.SpanIDFromHex(spanIDhex)
	if err != nil {
		return otel.GetTracerProvider().Tracer(tracerName).Start(ctx, apiName, trace.WithNewRoot())
	}
	if spanID == emptySpan {
		ctx, span := otel.GetTracerProvider().Tracer(tracerName).Start(ctx, apiName, trace.WithNewRoot())
		ctx = context.WithValue(ctx, ctxkey.Traceparent, SetTraceParentSpanID(traceParent, span.SpanContext().SpanID().String()))
		return ctx, span
	}
	sCtx := trace.NewSpanContext(trace.SpanContextConfig{
		TraceID:    traceID,
		SpanID:     spanID,
		TraceFlags: 0,
		TraceState: trace.TraceState{},
		Remote:     true,
	})
	ctx = trace.ContextWithRemoteSpanContext(ctx, sCtx)
	return otel.GetTracerProvider().Tracer(tracerName).Start(ctx, apiName)
}

// NewTraceParentWithEmptySpan generates a traceparent string based on the provided trace ID.  The spanID is left as a dummy value.
// The traceparent format follows the W3C Trace Context specification (https://www.w3.org/TR/trace-context/).
// Format: 00-{traceID}-{spanID}-00
func NewTraceParentWithEmptySpan(traceID [16]byte) string {
	return NewTraceParent(traceID, emptySpan)
}

// NewTraceParent returns a new W3C traceparent string using the provided traceID and spanID.
func NewTraceParent(traceID [16]byte, spanID [8]byte) string {
	return "00-" + hex.EncodeToString(traceID[:]) + "-" + hex.EncodeToString(spanID[:]) + "-00"
}

// NewTraceID generates a new W3C trace ID with 16 bytes of random data.
func NewTraceID() [16]byte {
	var traceID [16]byte
	if _, err := rand.Read(traceID[:]); err != nil {
		slog.Error("new trace parent: crypto get bytes: %w", err)
	}
	return traceID
}
