package header

import (
	"context"
	"github.com/nats-io/nats.go"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"testing"
)

func TestContextEncodimg(t *testing.T) {
	ctx := context.Background()
	ctx2 := toCtx(ctx, Values{"name1": "value1"})
	val := fromCtx(ctx2)
	assert.Equal(t, "value1", val["name1"])
}

func TestMsgEncoding(t *testing.T) {
	ctx := context.Background()
	msg := nats.NewMsg("testSubject")
	err := toMsg(Values{"name1": "value1"}, &msg.Header)
	require.NoError(t, err)
	val, err := fromMsg(ctx, msg.Header)
	require.NoError(t, err)
	assert.Equal(t, "value1", val["name1"])
}

func TestMsgNilDecoding(t *testing.T) {
	ctx := context.Background()
	msg := nats.NewMsg("testSubject")
	val, err := fromMsg(ctx, msg.Header)
	require.NoError(t, err)
	assert.Equal(t, "", val["name1"])
}
func TestContextNilDecodimg(t *testing.T) {
	ctx := context.Background()
	val := fromCtx(ctx)
	assert.Equal(t, "", val["name1"])
}
