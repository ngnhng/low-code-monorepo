package services

import (
	"context"
	"gitlab.com/shar-workflow/shar/common"
	"gitlab.com/shar-workflow/shar/model"
)

// EventProcessorFunc is the callback function type for processing workflow activities.
type EventProcessorFunc func(ctx context.Context, newActivityID string, traversal *model.WorkflowState, traverseOnly bool) error

// ProcessCompleteProcessorFunc is the callback for closing workflow processes.
type ProcessCompleteProcessorFunc func(ctx context.Context, activity *model.WorkflowState) error

// CompleteActivityProcessorFunc is the callback function type fired when an activity completes.
type CompleteActivityProcessorFunc func(ctx context.Context, activity *model.WorkflowState) error

// CompleteJobProcessorFunc is the callback function type for completed tasks.
type CompleteJobProcessorFunc func(ctx context.Context, job *model.WorkflowState) error

// MessageCompleteProcessorFunc is the callback function type for completed messages.
type MessageCompleteProcessorFunc func(ctx context.Context, state *model.WorkflowState) error

// TraversalFunc is the callback function type used to handle traversals.
type TraversalFunc func(ctx context.Context, pr *model.ProcessInstance, trackingId common.TrackingID, outbound *model.Targets, el map[string]*model.Element, state *model.WorkflowState) error

// LaunchFunc is the callback function type used to start child workflows.
type LaunchFunc func(ctx context.Context, state *model.WorkflowState) error

// MessageProcessorFunc is the callback function type used to create new workflow instances based on a timer.
type MessageProcessorFunc func(ctx context.Context, state *model.WorkflowState, execution *model.Execution, due int64) (bool, int, error)

// CompleteActivityFunc is the callback function type which generates complete activity events.
type CompleteActivityFunc func(ctx context.Context, state *model.WorkflowState) error

// AbortFunc is the callback function type called when a workflow object aborts.
type AbortFunc func(ctx context.Context, abort AbortType, state *model.WorkflowState) (bool, error)

// AbortType represents the type of termination being handled by the abort function
type AbortType int

const (
	AbortTypeActivity    = iota // AbortTypeActivity signifies an activity is being aborted
	AbortTypeServiceTask = iota // AbortTypeServiceTask signifies a service task is being aborted
)
