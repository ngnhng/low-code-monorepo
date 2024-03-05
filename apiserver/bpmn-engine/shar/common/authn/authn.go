package authn

import (
	"context"
	"gitlab.com/shar-workflow/shar/model"
)

// Check - checks authentication.
type Check func(ctx context.Context, request *model.ApiAuthenticationRequest) (*model.ApiAuthenticationResponse, error)
