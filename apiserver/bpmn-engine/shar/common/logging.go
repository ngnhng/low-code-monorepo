package common

import (
	"context"
	"errors"
	"fmt"
	"github.com/agoda-com/opentelemetry-go/otelslog"
	"github.com/agoda-com/opentelemetry-logs-go/exporters/otlp/otlplogs"
	sdk "github.com/agoda-com/opentelemetry-logs-go/sdk/logs"
	"github.com/nats-io/nats.go"
	"github.com/segmentio/ksuid"
	"gitlab.com/shar-workflow/shar/common/ctxkey"
	"gitlab.com/shar-workflow/shar/common/subj"
	"gitlab.com/shar-workflow/shar/model"
	"gitlab.com/shar-workflow/shar/server/messages"
	"go.opentelemetry.io/otel/sdk/resource"
	semconv "go.opentelemetry.io/otel/semconv/v1.21.0"
	"google.golang.org/protobuf/proto"
	"log/slog"
	"os"
)

// Log is the generic metod to output to SHAR telemetry.
func Log(ctx context.Context, js nats.JetStream, trackingID string, source model.LogSource, severity messages.WorkflowLogLevel, code int32, message string, attrs map[string]string) error {
	namespace := ctx.Value(ctxkey.SharNamespace)
	if namespace == nil {
		return fmt.Errorf("log write:%w", errors.New("attempt to log without context"))
	}
	tl := &model.TelemetryLogEntry{
		TrackingID: trackingID,
		Source:     source,
		Message:    message,
		Code:       code,
		Attributes: attrs,
	}
	b, err := proto.Marshal(tl)
	if err != nil {
		return fmt.Errorf("marshal for shar logging: %w", err)
	}
	sub := subj.NS(messages.WorkflowLog, subj.GetNS(ctx)) + string(severity)
	if _, err := js.Publish(sub, b, nats.MsgId(ksuid.New().String()), nats.Context(ctx)); err != nil {
		return fmt.Errorf("log publish failed: %w", err)
	}
	return nil
}

func newResource() *resource.Resource {
	hostName, _ := os.Hostname()
	return resource.NewWithAttributes(
		semconv.SchemaURL,
		semconv.ServiceName("shar-server"),
		semconv.ServiceVersion("1.0.0"),
		semconv.HostName(hostName),
	)
}

// NewOtelHandler constructs and initialises an otel handler for log exports
func NewOtelHandler() (slog.Handler, func() error) {
	ctx := context.Background()

	// configure opentelemetry logger provider
	logExporter, _ := otlplogs.NewExporter(ctx)
	loggerProvider := sdk.NewLoggerProvider(
		sdk.WithBatcher(logExporter),
		sdk.WithResource(newResource()),
	)

	// gracefully shutdown logger to flush accumulated signals before program finish
	shutdownFn := func() error {
		err := loggerProvider.Shutdown(ctx)
		if err != nil {
			return fmt.Errorf("error shutting down loggerProvider: %w", err)
		}
		return nil
	}

	return otelslog.NewOtelHandler(loggerProvider, &otelslog.HandlerOptions{}), shutdownFn
}

// NewTextHandler initialises a text handler writing to stdout for slog
func NewTextHandler(level slog.Level, addSource bool) slog.Handler {
	o := &slog.HandlerOptions{
		AddSource:   addSource,
		Level:       level,
		ReplaceAttr: nil,
	}
	return slog.NewTextHandler(os.Stdout, o)
}
