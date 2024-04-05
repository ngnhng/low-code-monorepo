package common

import (
	"gitlab.com/shar-workflow/shar/model"
	"google.golang.org/protobuf/proto"
)

// CopyWorkflowState - clones a proto model.WorkflowState for modification.
func CopyWorkflowState(state *model.WorkflowState) *model.WorkflowState {
	return proto.Clone(state).(*model.WorkflowState)
}

// DropStateParams removes any parameters unsafe to send across a state transition.
func DropStateParams(state *model.WorkflowState) {
	state.Execute = new(string)
	state.Condition = new(string)
	state.Owners = []string{}
	state.Groups = []string{}
}
