package header

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/gob"
	"fmt"
	"github.com/nats-io/nats.go"
	"gitlab.com/shar-workflow/shar/common/logx"
	"gitlab.com/shar-workflow/shar/server/errors"
)

// Values is a container for SHAR header values
type Values map[string]string

const natsSharHeader = "Shar-Header"

// NatsVersionHeader is the name of the header used to pass the SHAR client version.
const NatsVersionHeader = "Shar-Version"

// SharNamespace is the name of the header used to pass the client's declared namespace.
const SharNamespace = "Shar-Namespace"

// NatsCompatHeader is the name of the header used to pass the compatible version of SHAR.
const NatsCompatHeader = "Shar-Compat"

type contextKey string

// ContextKey is the key for SHAR header values in the context.
var ContextKey contextKey = "SHARHeader"

// FromCtxToMsgHeader attaches context information to a NATS message header.
func FromCtxToMsgHeader(ctx context.Context, header *nats.Header) error {
	vals := fromCtx(ctx)
	if err := toMsg(vals, header); err != nil {
		return fmt.Errorf("set message header: %w", err)
	}
	if cid := ctx.Value(logx.CorrelationContextKey); cid == nil {
		return errors.ErrMissingCorrelation
	}
	header.Add(logx.CorrelationHeader, ctx.Value(logx.CorrelationContextKey).(string))
	return nil
}

// FromMsgHeaderToCtx attaches NATS message header values to the context.
func FromMsgHeaderToCtx(ctx context.Context, header nats.Header) (context.Context, error) {
	vals, err := fromMsg(ctx, header)
	if err != nil {
		return nil, fmt.Errorf("retrieve message header values: %w", err)
	}
	ctx = context.WithValue(ctx, logx.CorrelationContextKey, header.Get(logx.CorrelationHeader))
	return toCtx(ctx, vals), nil
}

// Copy copies SHAR values from one context to another.
func Copy(source context.Context, target context.Context) context.Context {
	ret := context.WithValue(target, logx.CorrelationContextKey, source.Value(logx.CorrelationContextKey))
	ret = context.WithValue(ret, ContextKey, source.Value(ContextKey))
	return ret
}

// fromCtx extracts headers from a context
func fromCtx(ctx context.Context) (v Values) {
	defer func() {
		if r := recover(); r != nil {
			v = make(Values)
		}
	}()
	return ctx.Value(ContextKey).(Values)
}

// toCtx creates a child context containing headers
func toCtx(ctx context.Context, values Values) context.Context {
	return context.WithValue(ctx, ContextKey, values)
}

// fromMsg extracts SHAR headers from a NATS message
func fromMsg(ctx context.Context, header nats.Header) (Values, error) {
	hdr := header.Get(natsSharHeader)
	bin, err := base64.StdEncoding.DecodeString(hdr)
	if err != nil {
		return nil, fmt.Errorf("decode base 64 header: %w", err)
	}
	if len(bin) == 0 {
		return make(Values), nil
	}
	dec := gob.NewDecoder(bytes.NewBuffer(bin))
	m := make(Values)
	err = dec.Decode(&m)
	if err != nil {
		return nil, fmt.Errorf("decode gob header: %w", err)
	}
	return m, nil
}

// toMsg inserts SHAR headers into a nats message
func toMsg(values Values, header *nats.Header) error {
	var buf bytes.Buffer
	enc := gob.NewEncoder(&buf)
	err := enc.Encode(values)
	if err != nil {
		return fmt.Errorf("encode gob header: %w", err)
	}
	b64 := base64.StdEncoding.EncodeToString(buf.Bytes())
	header.Set(natsSharHeader, b64)
	return nil
}

// Set sets a context header value.
func Set(ctx context.Context, key string, value string) context.Context {
	c, ok := ctx.Value(ContextKey).(Values)
	if !ok {
		return context.WithValue(ctx, ContextKey, Values{key: value})
	}
	c[key] = value
	return context.WithValue(ctx, ContextKey, c)
}

// Get gets a context header value.
func Get(ctx context.Context, key string) string {
	vals, ok := ctx.Value(ContextKey).(Values)
	if !ok {
		return ""
	}
	return vals[key]
}
