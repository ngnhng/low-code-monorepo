package server

//go:generate mockery

import (
	"context"
	tracesdk "go.opentelemetry.io/otel/sdk/trace"
)

// Exporter represents an interface to the span exporter
type Exporter interface {
	ExportSpans(ctx context.Context, spans []tracesdk.ReadOnlySpan) error
}
