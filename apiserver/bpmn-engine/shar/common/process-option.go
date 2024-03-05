package common

import (
	"context"
	"github.com/nats-io/nats.go"
)

// ProcessOpts holds the settings for message processing.
type ProcessOpts struct {
	BackoffCalc BackoffFn
}

// ProcessOption represents an option function that can be passed to message processing.
type ProcessOption interface {
	Set(opts *ProcessOpts)
}

// BackoffFn represents a function that completely handles the backoff for a message including ACK/NAK
type BackoffFn func(ctx context.Context, msg *nats.Msg) error

// BackoffProcessOption holds the backoff function.  Don't use this directly.  Use the convenience function WithBackoffFn
type BackoffProcessOption struct {
	fn BackoffFn
}

// Set the backoff function in the process settings
func (b BackoffProcessOption) Set(opts *ProcessOpts) {
	opts.BackoffCalc = b.fn
}

// WithBackoffFn adds a back-off function to message processing
func WithBackoffFn(fn BackoffFn) BackoffProcessOption {
	return BackoffProcessOption{fn: fn}
}
