package client

import "gitlab.com/shar-workflow/shar/model"

// ErrTaskInUse is returned when an operation failed because it was attempted on a task in use.
type ErrTaskInUse struct {
	Err   error
	Usage *model.TaskSpecUsageReport
}

// Error returns the string version of the ErrWorkflowFatal error
func (e ErrTaskInUse) Error() string {
	return e.Err.Error()
}
