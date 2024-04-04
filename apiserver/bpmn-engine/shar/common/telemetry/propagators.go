package telemetry

import (
	"context"
	"github.com/nats-io/nats.go"
	"gitlab.com/shar-workflow/shar/common/ctxkey"
	"gitlab.com/shar-workflow/shar/common/middleware"
	"gitlab.com/shar-workflow/shar/model"
	"go.opentelemetry.io/contrib/propagators/autoprop"
)

// CtxWithSpanToNatsMsg injects traceID and spanID into a NATS message based on the provided context.
func CtxWithSpanToNatsMsg(ctx context.Context, msg *nats.Msg) {
	// If telemetry is enabled in the host application
	// We can utilise it to inject the traceID and spanID
	car := NewNatsCarrier(msg)
	prop := autoprop.NewTextMapPropagator()
	prop.Inject(ctx, car)
}

type propagateOptions struct {
	detaultTraceId [16]byte
}

// PropagateOption is the prototype for the propagate option function
type PropagateOption func(*propagateOptions)

// WithNewDefaultTraceId returns a PropagateOption function that sets the default trace ID to a newly generated trace ID.
func WithNewDefaultTraceId() PropagateOption {
	return func(o *propagateOptions) {
		o.detaultTraceId = NewTraceID()
	}
}

// NatsMsgToCtxWithSpan injects traceID and spanID into a context based on the provided NATS message.
func NatsMsgToCtxWithSpan(ctx context.Context, msg *nats.Msg) context.Context {
	car := NewNatsCarrier(msg)
	prop := autoprop.NewTextMapPropagator()
	return prop.Extract(ctx, car)
}

// TraceParams represents parameters related to tracing
type TraceParams struct {
	TraceParent string
}

// CtxWithTraceParentFromNatsMsgMiddleware is a middleware function that wraps the receive function in order to inject traceparent into the context based on the NATS message.
// The receive function should have the signature func(ctx context.Context, msg *nats.Msg) (context.Context, error).
func CtxWithTraceParentFromNatsMsgMiddleware() middleware.Receive {
	return func(ctx context.Context, msg *nats.Msg) (context.Context, error) {
		return CtxWithTraceParentFromNatsMsg(ctx, msg), nil
	}
}

// CtxWithTraceParentFromNatsMsg injects the traceparent value from a NATS message into the provided context. If the traceparent value is present in the message header, it is set as the value for the ctxkey.Traceparent key in the context.
// If the traceparent value is not present, a new traceparent value is generated with an empty spanID and set as the value for the ctxkey.Traceparent key in the context.
func CtxWithTraceParentFromNatsMsg(ctx context.Context, msg *nats.Msg) context.Context {
	if tp := msg.Header.Get("traceparent"); tp != "" {
		return context.WithValue(ctx, ctxkey.Traceparent, tp)
	}
	return context.WithValue(ctx, ctxkey.Traceparent, NewTraceParentWithEmptySpan(NewTraceID()))
}

// CtxWithTraceParentToWfState injects the traceparent from the context into a WorkflowState.
// If telemetry is enabled in the configuration, the traceID and spanID will be extracted from the context and assigned to the TraceParent field of the WorkflowState object.
func CtxWithTraceParentToWfState(ctx context.Context, state *model.WorkflowState) {
	state.TraceParent = ctx.Value(ctxkey.Traceparent).(string)
}
