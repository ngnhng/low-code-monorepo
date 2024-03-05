package output

import (
	"gitlab.com/shar-workflow/shar/model"
	"io"
	"os"
)

// Method represents the output method
type Method interface {
	OutputExecutionStatus(executionID string, states map[string][]*model.WorkflowState)
	OutputLoadResult(executionID string)
	OutputListExecution(res []*model.ListExecutionItem)
	OutputCancelledProcessInstance(id string)
	OutputUserTaskIDs(ut []*model.GetUserTaskResponse)
	OutputWorkflow(res []*model.ListWorkflowResponse)
	OutputStartWorkflowResult(wfiID string, wfID string)
}

// Current is the currently selected output method.
var Current Method

// Stream contains the output stream.  By default this os.Stdout, however, for testing it can be set to a byte buffer for instance.
var Stream io.Writer = os.Stdout
