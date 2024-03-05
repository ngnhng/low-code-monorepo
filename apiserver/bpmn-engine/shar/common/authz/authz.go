package authz

import (
	"context"
	"gitlab.com/shar-workflow/shar/model"
)

// APIFunc represents a function that can check whether a user is authorized to use a function.
type APIFunc func(ctx context.Context, request *model.ApiAuthorizationRequest) (*model.ApiAuthorizationResponse, error)
