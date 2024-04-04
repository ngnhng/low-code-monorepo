package valueparsing

import (
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"testing"
)

func TestExtract(t *testing.T) {
	text := `"orderId":int(78)`
	key, varType, value, err := extract(text)
	require.NoError(t, err)
	assert.Equal(t, "orderId", key, "Parser returned wrong value of the key")
	assert.Equal(t, "int", varType, "Parser returned wrong value of the type")
	assert.Equal(t, "78", value, "Parser returned wrong value")
}

func TestParse(t *testing.T) {
	args := []string{`"orderId":int(78)`, `"height":float64(103.101)`}
	vars, err := Parse(args)
	require.NoError(t, err)
	expectedOrderID := 78
	expectedHeight := 103.101
	assert.Equal(t, expectedOrderID, (*vars)["orderId"], "Parser returned wrong value")
	assert.Equal(t, expectedHeight, (*vars)["height"], "Parser returned wrong value")
}
