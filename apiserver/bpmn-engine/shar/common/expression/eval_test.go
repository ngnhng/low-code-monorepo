package expression

import (
	"context"
	"github.com/stretchr/testify/assert"
	"gitlab.com/shar-workflow/shar/model"
	"testing"
)

func TestPositive(t *testing.T) {
	ctx := context.Background()
	res, err := Eval[bool](ctx, "97 == 97", model.Vars{})
	assert.NoError(t, err)
	assert.Equal(t, true, res)
}

func TestNoVariable(t *testing.T) {
	ctx := context.Background()
	res, err := Eval[bool](ctx, "a == 4.5", model.Vars{})
	assert.NoError(t, err)
	assert.Equal(t, false, res)
}

func TestVariable(t *testing.T) {
	ctx := context.Background()
	res, err := Eval[bool](ctx, "a == 4.5", model.Vars{"a": 4.5})
	assert.NoError(t, err)
	assert.Equal(t, true, res)
}
