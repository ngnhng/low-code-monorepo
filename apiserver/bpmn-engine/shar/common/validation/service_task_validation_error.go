package validation

import "errors"

var (
	ErrTaskSpecVersion         = errors.New("invalid task spec version")                                           // ErrTaskSpecVersion is thrown when the task version.
	ErrServiceTaskNoMetadata   = errors.New("no metadata section")                                                 // ErrServiceTaskNoMetadata is thrown when there is no metadata section present in the spec.
	ErrServiceTaskDuration     = errors.New("invalid max estimated duration")                                      // ErrServiceTaskDuration is thrown when the estimated duration is bad.
	ErrNoDefaultRetry          = errors.New("no default retry section")                                            // ErrNoDefaultRetry is thrown when no default retry was provided.
	ErrServiceTaskNoParameters = errors.New("no parameters section")                                               // ErrServiceTaskNoParameters is thrown when there is no parameters section in the spec.
	ErrServiceMockValue        = errors.New("no mock value provided")                                              // ErrServiceMockValue is thrown when the task is a mock, but there is no default value.
	ErrServiceTaskNatsName     = errors.New("names must be compatible with NATS and contain no spaces or periods") // ErrServiceTaskNatsName is thrown when a name is not compatible with NATS.
	ErrInvalidRetry            = errors.New("no mock value provided")                                              // ErrInvalidRetry is thrown
)
