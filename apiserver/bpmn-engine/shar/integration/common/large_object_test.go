package common

import (
	"context"
	"github.com/nats-io/nats.go"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gitlab.com/shar-workflow/shar/common"
	"gitlab.com/shar-workflow/shar/model"
	zensvr "gitlab.com/shar-workflow/shar/zen-shar/server"
	"testing"
	"time"
)

func TestLargeSaveLoad(t *testing.T) {
	ss, ns, err := zensvr.GetServers(10, nil, nil)
	NatsURL := ns.GetEndPoint()

	defer ss.Shutdown()
	defer ns.Shutdown()
	require.NoError(t, err)
	nc, err := nats.Connect(NatsURL)
	require.NoError(t, err)
	js, err := nc.JetStream()
	require.NoError(t, err)
	kv, err := js.CreateKeyValue(&nats.KeyValueConfig{
		Bucket:  "testlock",
		TTL:     time.Second * 2,
		Storage: nats.MemoryStorage,
	})
	require.NoError(t, err)
	ds, err := js.CreateObjectStore(&nats.ObjectStoreConfig{
		Bucket:  "testobj",
		Storage: nats.MemoryStorage,
	})
	require.NoError(t, err)
	ctx := context.Background()
	rctx, cancel := context.WithTimeout(ctx, time.Second*1)
	defer cancel()
	err = common.SaveLarge(rctx, ds, kv, "testKey", []byte("hello"))
	require.NoError(t, err)
	rctx, cancel2 := context.WithTimeout(ctx, time.Second*1)
	defer cancel2()
	b, err := common.LoadLarge(rctx, ds, kv, "testKey")
	require.NoError(t, err)
	assert.Equal(t, "hello", string(b))
}

func TestLargeObjSaveLoad(t *testing.T) {
	ss, ns, err := zensvr.GetServers(10, nil, nil)
	NatsURL := ns.GetEndPoint()
	defer ss.Shutdown()
	defer ns.Shutdown()
	require.NoError(t, err)
	nc, err := nats.Connect(NatsURL)
	require.NoError(t, err)
	js, err := nc.JetStream()
	require.NoError(t, err)
	kv, err := js.CreateKeyValue(&nats.KeyValueConfig{
		Bucket:  "testlock",
		TTL:     time.Second * 2,
		Storage: nats.MemoryStorage,
	})
	require.NoError(t, err)
	ds, err := js.CreateObjectStore(&nats.ObjectStoreConfig{
		Bucket:  "testobj",
		Storage: nats.MemoryStorage,
	})
	require.NoError(t, err)

	testThing := &model.Gateway{
		MetExpectations: map[string]string{"dummy": "someExpectation"},
		Vars:            [][]byte{},
		Visits:          0,
	}

	ctx := context.Background()
	rctx, cancel := context.WithTimeout(ctx, time.Second*1)
	defer cancel()
	err = common.SaveLargeObj(rctx, ds, kv, "testKey", testThing)
	require.NoError(t, err)
	rctx, cancel2 := context.WithTimeout(ctx, time.Second*1)
	defer cancel2()

	newThing := &model.Gateway{}
	err = common.LoadLargeObj(rctx, ds, kv, "testKey", newThing)
	require.NoError(t, err)
	assert.Equal(t, "someExpectation", newThing.MetExpectations["dummy"])
}

func TestLargeObjUpdate(t *testing.T) {
	ss, ns, err := zensvr.GetServers(10, nil, nil)
	NatsURL := ns.GetEndPoint()

	defer ss.Shutdown()
	defer ns.Shutdown()
	require.NoError(t, err)
	nc, err := nats.Connect(NatsURL)
	require.NoError(t, err)
	js, err := nc.JetStream()
	require.NoError(t, err)
	kv, err := js.CreateKeyValue(&nats.KeyValueConfig{
		Bucket:  "testlock",
		TTL:     time.Second * 2,
		Storage: nats.MemoryStorage,
	})
	require.NoError(t, err)
	ds, err := js.CreateObjectStore(&nats.ObjectStoreConfig{
		Bucket:  "testobj",
		Storage: nats.MemoryStorage,
	})
	require.NoError(t, err)

	testThing := &model.Gateway{
		MetExpectations: map[string]string{"dummy": "someExpectation"},
		Vars:            [][]byte{},
		Visits:          0,
	}

	ctx := context.Background()
	rctx, cancel := context.WithTimeout(ctx, time.Second*1)
	defer cancel()
	err = common.SaveLargeObj(rctx, ds, kv, "testKey", testThing)
	require.NoError(t, err)
	rctx, cancel2 := context.WithTimeout(ctx, time.Second*1)
	defer cancel2()
	emptyTestThing := &model.Gateway{}
	_, err = common.UpdateLargeObj(rctx, ds, kv, "testKey", emptyTestThing, func(v *model.Gateway) (*model.Gateway, error) {
		v.MetExpectations["new"] = "newExpectation"
		return v, nil
	})
	require.NoError(t, err)
	rctx, cancel3 := context.WithTimeout(ctx, time.Second*1)
	defer cancel3()
	newThing := &model.Gateway{}
	err = common.LoadLargeObj(rctx, ds, kv, "testKey", newThing)
	require.NoError(t, err)
	assert.Equal(t, "someExpectation", newThing.MetExpectations["dummy"])
}

func TestLargeObjDelete(t *testing.T) {
	ss, ns, err := zensvr.GetServers(10, nil, nil)
	NatsURL := ns.GetEndPoint()
	defer ss.Shutdown()
	defer ns.Shutdown()
	require.NoError(t, err)
	nc, err := nats.Connect(NatsURL)
	require.NoError(t, err)
	js, err := nc.JetStream()
	require.NoError(t, err)
	kv, err := js.CreateKeyValue(&nats.KeyValueConfig{
		Bucket:  "testlock",
		TTL:     time.Second * 2,
		Storage: nats.MemoryStorage,
	})
	require.NoError(t, err)
	ds, err := js.CreateObjectStore(&nats.ObjectStoreConfig{
		Bucket:  "testobj",
		Storage: nats.MemoryStorage,
	})
	require.NoError(t, err)

	testThing := &model.Gateway{
		MetExpectations: map[string]string{"dummy": "someExpectation"},
		Vars:            [][]byte{},
		Visits:          0,
	}

	ctx := context.Background()
	rctx, cancel := context.WithTimeout(ctx, time.Second*1)
	defer cancel()
	err = common.SaveLargeObj(rctx, ds, kv, "testKey", testThing)
	require.NoError(t, err)
	rctx, cancel2 := context.WithTimeout(ctx, time.Second*1)
	defer cancel2()
	err = common.DeleteLarge(rctx, ds, kv, "testKey")
	require.NoError(t, err)
	_, err = ds.List()
	assert.ErrorIs(t, err, nats.ErrNoObjectsFound)
}
