package services

import (
	"context"
	"gitlab.com/shar-workflow/shar/model"
)

// Storage provides the interface for sotrage to the SHAR client.
type Storage interface {
	GetJob(ctx context.Context, id string) (*model.WorkflowState, error)
}
