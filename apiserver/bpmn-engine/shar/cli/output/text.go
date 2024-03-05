package output

import (
	"fmt"
	"github.com/pterm/pterm"
	"github.com/pterm/pterm/putils"
	"gitlab.com/shar-workflow/shar/common"
	"gitlab.com/shar-workflow/shar/model"
	"time"
)

// Text provides a client output implementation for console
type Text struct {
}

// OutputStartWorkflowResult returns a CLI response
func (c *Text) OutputStartWorkflowResult(executionID string, wfID string) {
	fmt.Println("Execution:", executionID)
	fmt.Println("Workflow:", wfID)
}

// OutputWorkflow returns a CLI response
func (c *Text) OutputWorkflow(res []*model.ListWorkflowResponse) {
	for _, v := range res {
		fmt.Println(v.Name, v.Version)
	}
}

// OutputListExecution returns a CLI response
func (c *Text) OutputListExecution(res []*model.ListExecutionItem) {
	for i, v := range res {
		fmt.Println(i, ":", v.Id, "version", v.Version)
	}
}

// OutputUserTaskIDs returns a CLI response
func (c *Text) OutputUserTaskIDs(ut []*model.GetUserTaskResponse) {
	for i, v := range ut {
		fmt.Println(i, ": id:", v.TrackingId, "description:", v.Description)
	}
}

// OutputCancelledProcessInstance returns a CLI response
func (c *Text) OutputCancelledProcessInstance(id string) {
	fmt.Println("process instance", id, "cancelled.")
}

// OutputExecutionStatus outputs an execution status
func (c *Text) OutputExecutionStatus(executionID string, states map[string][]*model.WorkflowState) {
	fmt.Println("Execution: " + executionID)

	ll := make(pterm.LeveledList, 0, len(states)*7+1)

	for p, sts := range states {
		ll = append(ll, pterm.LeveledListItem{Level: 0, Text: "Process ID: " + p})
		for _, st := range sts {
			ll = append(ll, pterm.LeveledListItem{Level: 0, Text: "Tracking ID: " + common.TrackingID(st.Id).ID()})
			ll = append(ll, pterm.LeveledListItem{Level: 1, Text: "Element"})
			ll = append(ll, pterm.LeveledListItem{Level: 2, Text: "ID: " + st.ElementId})
			ll = append(ll, pterm.LeveledListItem{Level: 2, Text: "Type: " + st.ElementType})
			ll = append(ll, pterm.LeveledListItem{Level: 1, Text: "State: " + st.State.String()})
			ll = append(ll, pterm.LeveledListItem{Level: 1, Text: "Executing: " + readStringPtr(st.Execute)})
			ll = append(ll, pterm.LeveledListItem{Level: 1, Text: "Since: " + time.Unix(0, st.UnixTimeNano).Format("“2006-01-02T15:04:05.999999999Z07:00”")})
		}
	}
	root := putils.TreeFromLeveledList(ll)
	op, err := pterm.DefaultTree.WithRoot(root).Srender()
	if err != nil {
		panic(fmt.Errorf("render: %w", err))
	}
	if _, err := Stream.Write([]byte(op)); err != nil {
		panic(err)
	}
}

// OutputLoadResult returns a CLI response
func (c *Text) OutputLoadResult(workflowID string) {
	fmt.Println("Workflow id: " + workflowID)
}

func readStringPtr(ptr *string) string {
	if ptr == nil {
		return ""
	}

	return *ptr
}
