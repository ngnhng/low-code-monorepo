package subj

import (
	"context"
	"fmt"
	"gitlab.com/shar-workflow/shar/common/ctxkey"
	"gitlab.com/shar-workflow/shar/common/namespace"
	"strings"
)

// NS returns a subject with the placeholder replaced with the namespace
func NS(subj string, ns string) string {
	if strings.Contains(subj, "%s") {
		return fmt.Sprintf(subj, ns)
	}
	return subj
}

// GetNS fetches the current shar namespace from the context
func GetNS(ctx context.Context) string {
	v := ctx.Value(ctxkey.SharNamespace)
	if v != nil {
		return v.(string)
	}
	return namespace.Default
}

// SetNS sets the namespace in the given context and returns a new context.
func SetNS(ctx context.Context, namespace string) context.Context {
	newCtx := context.WithValue(ctx, ctxkey.SharNamespace, namespace)
	return newCtx
}
