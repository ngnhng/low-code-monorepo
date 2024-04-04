package output

import (
	"encoding/json"
	"gitlab.com/shar-workflow/shar/common"
	"gitlab.com/shar-workflow/shar/model"
)

// Json contains the output methods for returning json CLI responses
type Json struct {
}

// OutputStartWorkflowResult returns a CLI response
func (c *Json) OutputStartWorkflowResult(executionID string, wfID string) {
	outJson(struct {
		ExecutionID string
		WorkflowID  string
	}{
		ExecutionID: executionID,
		WorkflowID:  wfID,
	})
}

// OutputWorkflow returns a CLI response
func (c *Json) OutputWorkflow(res []*model.ListWorkflowResponse) {
	outJson(struct {
		Workflow []*model.ListWorkflowResponse
	}{
		Workflow: res,
	})
}

// OutputListExecution returns a CLI response
func (c *Json) OutputListExecution(res []*model.ListExecutionItem) {
	outJson(struct {
		Execution []*model.ListExecutionItem
	}{
		Execution: res,
	})
}

// OutputUserTaskIDs returns a CLI response
func (c *Json) OutputUserTaskIDs(ut []*model.GetUserTaskResponse) {
	outJson(struct {
		UserTasks []*model.GetUserTaskResponse
	}{
		UserTasks: ut,
	})
}

// OutputExecutionStatus outputs an execution status to console
func (c *Json) OutputExecutionStatus(executionID string, states map[string][]*model.WorkflowState) {
	type retState struct {
		TrackingId string
		ID         string
		Type       string
		State      string
		Executing  string
		Since      int64
	}

	type retExecution struct {
		ExecutionId string
		Processes   map[string][]retState
	}

	rs := make(map[string][]retState, len(states))
	for pi, sts := range states {
		rsa := make([]retState, 0, len(sts))
		for _, st := range sts {
			rsa = append(rsa, retState{
				TrackingId: common.TrackingID(st.Id).ID(),
				ID:         st.ElementId,
				Type:       st.ElementType,
				State:      st.State.String(),
				Executing:  readStringPtr(st.Execute),
				Since:      st.UnixTimeNano,
			})
		}
		rs[pi] = rsa
	}
	outJson(retExecution{ExecutionId: executionID, Processes: rs})
}

// OutputLoadResult returns a CLI response
func (c *Json) OutputLoadResult(workflowID string) {
	outJson(struct {
		WorkflowID string
	}{
		WorkflowID: workflowID,
	})
}

// OutputCancelledProcessInstance returns a CLI response
func (c *Json) OutputCancelledProcessInstance(id string) {
	outJson(struct {
		Cancelled string
	}{
		Cancelled: id,
	})
}

func outJson(js interface{}) {
	op, err := json.Marshal(&js)
	if err != nil {
		panic(err)
	}
	if _, err := Stream.Write(op); err != nil {
		panic(err)
	}
}
