package client

import (
	"gitlab.com/shar-workflow/shar/model"
)

type registerTaskOptions struct {
	id   string
	spec *model.TaskSpec
}

// RegOpt represents an option that can be passed to the task register function.
type RegOpt interface {
	apply(*registerTaskOptions)
}

// FixedIDOption contains a fixed ID which will be used to register a task
type FixedIDOption struct {
	id string
}

func (o FixedIDOption) apply(opt *registerTaskOptions) {
	opt.id = o.id
}

// WithFixedID is a modifier which returns a FixedIDOption containing the specified ID.
func WithFixedID(id string) FixedIDOption {
	return FixedIDOption{id: id}
}

// TaskSpecOption contains the task specification.
type TaskSpecOption struct {
	spec *model.TaskSpec
}

func (o TaskSpecOption) apply(opt *registerTaskOptions) {
	opt.spec = o.spec
}

// WithSpec allows the client to define a task specification to SHAR.
func WithSpec(spec *model.TaskSpec) TaskSpecOption {
	return TaskSpecOption{spec: spec}
}
