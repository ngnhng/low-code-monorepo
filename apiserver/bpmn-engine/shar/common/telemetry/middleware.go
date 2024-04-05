package telemetry

import (
	"context"
	"github.com/nats-io/nats.go"
	"gitlab.com/shar-workflow/shar/common/middleware"
)

// CtxSpanToNatsMsgMiddleware returns a middleware function which attaches telemetry to outgoing messages.
func CtxSpanToNatsMsgMiddleware() middleware.Send {
	return func(ctx context.Context, msg *nats.Msg) error {
		CtxWithSpanToNatsMsg(ctx, msg)
		return nil
	}
}

// NatsMsgToCtxWithSpanMiddleware returns a middleware function which extracts telemetry from incoming messages.
func NatsMsgToCtxWithSpanMiddleware() middleware.Receive {
	return func(ctx context.Context, msg *nats.Msg) (context.Context, error) {
		return NatsMsgToCtxWithSpan(ctx, msg), nil
	}
}
