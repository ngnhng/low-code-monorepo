package intTest

import (
	"bytes"
	"fmt"
	"github.com/stretchr/testify/require"
	"gitlab.com/shar-workflow/shar/client/parser"
	"gitlab.com/shar-workflow/shar/common/linter"
	"os"
	"testing"
)

func TestSimpleNoEnd(t *testing.T) {

	// Load BPMN workflow
	b, err := os.ReadFile("../../testdata/bad/simple-workflow-no-end.bpmn")
	require.NoError(t, err)

	wf, err := parser.Parse("SimpleWorkflowTest", bytes.NewBuffer(b))
	require.ErrorIs(t, err, linter.ErrMissingEndEvent)

	fmt.Println(wf)
}

func TestCyclic(t *testing.T) {

	// Load BPMN workflow
	b, err := os.ReadFile("../../testdata/bad/simple-cyclic.bpmn")
	require.NoError(t, err)

	wf, err := parser.Parse("SimpleWorkflowTest", bytes.NewBuffer(b))
	require.NoError(t, err)

	fmt.Println(wf)
}

func TestCyclicNoEnd(t *testing.T) {

	// Load BPMN workflow
	b, err := os.ReadFile("../../testdata/bad/simple-cyclic-no-end.bpmn")
	require.NoError(t, err)

	wf, err := parser.Parse("SimpleWorkflowTest", bytes.NewBuffer(b))
	require.ErrorIs(t, err, linter.ErrMissingEndEvent)

	fmt.Println(wf)
}

func TestCloseWithNoOpen(t *testing.T) {

	// Load BPMN workflow
	b, err := os.ReadFile("../../testdata/bad/simple-close-with-no-opening-gateway.bpmn")
	require.NoError(t, err)

	wf, err := parser.Parse("SimpleWorkflowTest", bytes.NewBuffer(b))
	require.ErrorIs(t, err, linter.ErrMissingOpeningGateway)

	fmt.Println(wf)
}
