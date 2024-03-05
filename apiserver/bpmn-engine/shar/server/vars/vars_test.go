package vars

import (
	"context"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gitlab.com/shar-workflow/shar/model"
	"testing"
)

func TestEncodeDecodeVars(t *testing.T) {
	v := make(model.Vars)
	ctx := context.Background()
	v["first"] = 56
	v["second"] = "elvis"
	v["third"] = 5.98

	e, err := Encode(ctx, v)
	require.NoError(t, err)
	d, err := Decode(ctx, e)
	require.NoError(t, err)
	assert.Equal(t, v["first"], d["first"])
	assert.Equal(t, v["second"], d["second"])
	assert.Equal(t, v["third"], d["third"])
}
