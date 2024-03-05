package errors

import (
	"errors"
	"fmt"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestErrWorkflowFatal_Error(t *testing.T) {
	err := &ErrWorkflowFatal{Err: errors.New("ouch")}
	err2 := errors.New("any old error")
	err3 := fmt.Errorf("some downstream error: %w", err)
	assert.True(t, IsWorkflowFatal(err))
	assert.False(t, IsWorkflowFatal(err2))
	assert.True(t, IsWorkflowFatal(err3))
}
