package common

import (
	"context"
	"log/slog"
)

// MultiHandler implements slog.Handler and wraps a collection of slog.Handlers that are delegated to
type MultiHandler struct {
	Handlers []slog.Handler
}

// Enabled always returns true as the actual decision as to whether a log record is emitted is delegated to the wrapped handlers in the Handle method
func (mh *MultiHandler) Enabled(_ context.Context, _ slog.Level) bool {
	return true
	// always enabled as this is a composite handler. We check for each handler in Handle() anyway
}

// Handle will iterate over the slice of wrapped handlers and determine whether that handler is Enabled for the given record log level
func (mh *MultiHandler) Handle(ctx context.Context, r slog.Record) error {
	for _, h := range mh.Handlers {
		if h.Enabled(ctx, r.Level) {
			_ = h.Handle(ctx, r)
			// slog.log() ignores any errors Handle throws so there seems little sense
			// in handling them. In fact, we probably want all handlers Handle()
			// method to be called even if there are failures for some of them...
		}
	}

	return nil
}

// WithAttrs adds the supplied attrs slice to the delegated handler attrs and returns new instances of them
func (mh *MultiHandler) WithAttrs(attrs []slog.Attr) slog.Handler {
	handlersWithAttrs := []slog.Handler{}
	for _, h := range mh.Handlers {
		handlersWithAttrs = append(handlersWithAttrs, h.WithAttrs(attrs))
	}

	return &MultiHandler{
		Handlers: handlersWithAttrs,
	}
}

// WithGroup adds the supplied group name to the delegated handler name and returns new instances of them
func (mh *MultiHandler) WithGroup(name string) slog.Handler {
	hWithGroup := make([]slog.Handler, 0, len(mh.Handlers))
	for _, h := range mh.Handlers {
		hWithGroup = append(hWithGroup, h.WithGroup(name))
	}

	return &MultiHandler{
		Handlers: hWithGroup,
	}
}

// NewMultiHandler creates a new instance of a multi handler
func NewMultiHandler(handlers []slog.Handler) *MultiHandler {
	return &MultiHandler{
		Handlers: handlers,
	}
}
