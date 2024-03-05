package middleware

import (
	"context"
	"github.com/nats-io/nats.go"
)

// Send is the prototype for a middleware send function.
type Send func(ctx context.Context, msg *nats.Msg) error

// Receive is the prototype for a middleware receive function.
type Receive func(ctx context.Context, msg *nats.Msg) (context.Context, error)
