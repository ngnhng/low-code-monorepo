package client

import (
	"context"
	"testing"

	version2 "github.com/hashicorp/go-version"
	"github.com/stretchr/testify/require"
	zensvr "gitlab.com/shar-workflow/shar/zen-shar/server"
)

func TestHigherClientVersion(t *testing.T) {
	ss, ns, err := zensvr.GetServers(4, nil, nil, zensvr.WithSharVersion("1.0.503"))
	natsURL := ns.GetEndPoint()
	require.NoError(t, err)
	defer ns.Shutdown()
	go ss.Listen()
	forcedVersion, err := version2.NewVersion("v99.0.0")
	require.NoError(t, err)
	cl := New(forceVersion{ver: forcedVersion, compatVer: forcedVersion})
	ctx := context.Background()
	err = cl.Dial(ctx, natsURL)
	require.Error(t, err)
}

type forceVersion struct {
	ver       *version2.Version
	compatVer *version2.Version
}

func (o forceVersion) configure(client *Client) {
	client.version = o.ver
	client.ExpectedCompatibleServerVersion = o.compatVer
}
