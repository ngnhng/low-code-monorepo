package intTest

/*
import (
	"context"
	"fmt"
	"github.com/nats-io/nats.go"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gitlab.com/shar-workflow/shar/common/setup"
	sharVersion "gitlab.com/shar-workflow/shar/common/version"
	zensvr "gitlab.com/shar-workflow/shar/zen-shar/server"
	rand2 "golang.org/x/exp/rand"
	"testing"
	"time"
)

func TestUpgradeNATSObjects(t *testing.T) {
	natsHost := "127.0.0.1"
	natsPort := 4459 + rand2.Intn(500)
	NatsURL := fmt.Sprintf("nats://%s:%v", natsHost, natsPort)

	ss, ns, err := zensvr.GetServers(natsHost, natsPort, 8, nil, nil, zensvr.WithSharVersion("v1.0.0"))
	require.NoError(t, err)
	defer func() {
		ss.Shutdown()
		ns.Shutdown()
		ns.WaitForShutdown()
	}()
	nc, err := nats.Connect(NatsURL)
	require.NoError(t, err)
	js, err := nc.JetStream()
	require.NoError(t, err)

	ctx := context.Background()
	err = setup.EnsureStream(ctx, nc, js, nats.StreamConfig{
		Name:        "TestStream",
		Description: "SHAR",
		Subjects:    []string{"TestStream.*.State.Job.Activate.Gateway"},
		Storage:     nats.MemoryStorage,
	})
	require.NoError(t, err)
	si, err := js.StreamInfo("TestStream")
	require.NoError(t, err)
	assert.Equal(t, "SHAR v1.0.1", si.Config.Description)
	assert.Len(t, si.Config.Subjects, 1)
	err = setup.EnsureConsumer(js, "TestStream", nats.ConsumerConfig{
		Durable:         "GatewayActivateConsumer",
		Description:     "Tracking queue for gateway activation",
		AckPolicy:       nats.AckExplicitPolicy,
		AckWait:         30 * time.Second,
		FilterSubject:   "TestStream.*.State.Job.Activate.Gateway",
		MaxAckPending:   1,
		MaxRequestBatch: 1,
	})
	require.NoError(t, err)
	ci, err := js.ConsumerInfo("TestStream", "GatewayActivateConsumer")
	require.NoError(t, err)
	assert.Equal(t, 30*time.Second, ci.Config.AckWait)
	assert.Equal(t, "TestStream.*.State.Job.Activate.Gateway", ci.Config.FilterSubject)
	assert.Equal(t, 1, ci.Config.MaxAckPending)

	sharVersion.Version = "v1.0.2"

	err = setup.EnsureStream(ctx, nc, js, nats.StreamConfig{
		Name:        "TestStream",
		Description: "SHAR",
		Subjects:    []string{"TestStream.*.State.Job.Activate.Gateway", "TestStream.*.State.Job.Abort.Gateway"},
		Storage:     nats.MemoryStorage,
	})
	require.NoError(t, err)
	si, err = js.StreamInfo("TestStream")
	require.NoError(t, err)
	assert.Len(t, si.Config.Subjects, 2)
	assert.Equal(t, "SHAR v1.0.2", si.Config.Description)
	err = setup.EnsureConsumer(js, "TestStream", nats.ConsumerConfig{
		Durable:         "GatewayActivateConsumer",
		Description:     "Tracking queue for gateway activation",
		AckPolicy:       nats.AckExplicitPolicy,
		AckWait:         30 * time.Second,
		FilterSubject:   "TestStream.*.State.Job.Abort.Gateway",
		MaxAckPending:   65535,
		MaxRequestBatch: 2,
	})
	require.NoError(t, err)
	ci, err = js.ConsumerInfo("TestStream", "GatewayActivateConsumer")
	require.NoError(t, err)
	assert.Equal(t, 30*time.Second, ci.Config.AckWait)
	assert.Equal(t, "TestStream.*.State.Job.Abort.Gateway", ci.Config.FilterSubject)
	assert.Equal(t, 65535, ci.Config.MaxAckPending)
	assert.Equal(t, 2, ci.Config.MaxRequestBatch)

	sharVersion.Version = "v1.0.1"
	err = setup.EnsureStream(ctx, nc, js, nats.StreamConfig{
		Name:        "TestStream",
		Description: "SHAR",
		Subjects:    []string{"TestStream.*.State.Job.Abort.Gateway"},
		Storage:     nats.MemoryStorage,
	})
	require.NoError(t, err)
	si, err = js.StreamInfo("TestStream")
	require.NoError(t, err)
	assert.Len(t, si.Config.Subjects, 2)
	assert.Equal(t, "SHAR v1.0.2", si.Config.Description)
	err = setup.EnsureConsumer(js, "TestStream", nats.ConsumerConfig{
		Durable:         "GatewayActivateConsumer",
		Description:     "Tracking queue for gateway activation",
		AckPolicy:       nats.AckExplicitPolicy,
		AckWait:         30 * time.Second,
		FilterSubject:   "TestStream.*.State.Job.Abort.Gateway",
		MaxAckPending:   65535,
		MaxRequestBatch: 2,
	})
	require.NoError(t, err)
	ci, err = js.ConsumerInfo("TestStream", "GatewayActivateConsumer")
	require.NoError(t, err)
	assert.Equal(t, 30*time.Second, ci.Config.AckWait)
	assert.Equal(t, "TestStream.*.State.Job.Abort.Gateway", ci.Config.FilterSubject)
	assert.Equal(t, 65535, ci.Config.MaxAckPending)
	assert.Equal(t, 2, ci.Config.MaxRequestBatch)
}
*/
