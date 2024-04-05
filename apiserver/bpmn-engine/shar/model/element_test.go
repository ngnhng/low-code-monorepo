package model_test

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"gitlab.com/shar-workflow/shar/model"
)

func TestVarsGet(t *testing.T) {
	type testType struct {
		int
		string
	}

	vars := model.Vars{"1": "value", "2": 77777.77777, "4": testType{1, "2"}}

	s, err := vars.GetString("1")

	assert.NoError(t, err)
	assert.Equal(t, "value", s)

	f, err := vars.GetFloat64("2")

	assert.NoError(t, err)
	assert.Equal(t, 77777.77777, f)

	_, err = vars.GetInt("2")
	assert.Error(t, err)

	_, err = vars.GetBytes("3")
	assert.Error(t, err)

	y, err := model.Get[testType](vars, "4")
	assert.NoError(t, err)
	assert.Equal(t, testType{1, "2"}, y)
}
