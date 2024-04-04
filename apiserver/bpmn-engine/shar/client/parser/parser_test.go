package parser

import (
	"bytes"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gitlab.com/shar-workflow/shar/common/element"
	"gitlab.com/shar-workflow/shar/model"
	"golang.org/x/exp/slices"
	"os"
	"testing"
)

//goland:noinspection GoNilness
func TestParseWorkflowDuration(t *testing.T) {
	b, err := os.ReadFile("../../testdata/test-timer-parse-duration.bpmn")
	require.NoError(t, err)
	p, err := Parse("Test", bytes.NewBuffer(b))
	require.NoError(t, err)
	assert.Equal(t, "2000000000", p.Process["Process_0cxoltv"].Elements[1].Execute)
}

func TestMessageStart(t *testing.T) {
	b, err := os.ReadFile("../../testdata/message-start-test.bpmn")
	require.NoError(t, err)
	workflowName := "MessageStart"
	wf, err := Parse(workflowName, bytes.NewBuffer(b))
	require.NoError(t, err)

	processIdWithMessageStartEvent := "Process_0w6dssp"
	processElements := wf.Process[processIdWithMessageStartEvent].Elements

	expectedMessageStartEventId := "StartEvent_1"
	expectedType := element.StartEvent
	expectedMessageName := "startDemoMsg"

	require.True(t, slices.ContainsFunc(
		processElements,
		func(e *model.Element) bool {
			return e.Id == expectedMessageStartEventId &&
				e.Type == expectedType &&
				e.Msg == expectedMessageName
		},
	),
		"does not contain the expected start event message '%s', type '%s' and messageName '%s'", expectedMessageStartEventId, expectedType, expectedMessageName)

	startMessageMessageReceivers := wf.MessageReceivers[expectedMessageName]

	require.True(t, slices.ContainsFunc(
		startMessageMessageReceivers.MessageReceiver,
		func(e *model.MessageReceiver) bool {
			return e.Id == expectedMessageStartEventId &&
				e.ProcessIdToStart == processIdWithMessageStartEvent
		},
	),
		"message receiver did not have expected Id and ProcessIdToStart")

	assert.Equal(t, workflowName, startMessageMessageReceivers.AssociatedWorkflowName)
}
