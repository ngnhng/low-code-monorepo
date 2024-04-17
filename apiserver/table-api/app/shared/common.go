package shared

import "context"

type (
	UserContextKey string
)

const (
	UserKey = UserContextKey("USER_CTX")
)

type (
	RequestContext interface {
		GetUserId() string
		GetContext() context.Context
	}
)
