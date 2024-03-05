package workflow

import (
	"bytes"
	"github.com/stretchr/testify/require"
	"gitlab.com/shar-workflow/shar/client/parser"
	"gitlab.com/shar-workflow/shar/model"
	"go.opentelemetry.io/otel/trace"

	"os"
	"testing"
)

func setupTestWorkflow(t *testing.T, workflowFilename string, workflowName string, tp trace.TracerProvider) (*Engine, *MockNatsService, *model.Workflow) {
	svc := &MockNatsService{}

	eng, err := New(svc)
	require.NoError(t, err)
	b, err := os.ReadFile("../../testdata/" + workflowFilename)
	require.NoError(t, err)
	wf, err := parser.Parse(workflowName, bytes.NewBuffer(b))
	require.NoError(t, err)

	return eng, svc, wf
}
