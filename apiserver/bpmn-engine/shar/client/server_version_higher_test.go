package client

import (
	"context"
	"testing"

	version2 "github.com/hashicorp/go-version"
	"github.com/stretchr/testify/require"
	zenSvr "gitlab.com/shar-workflow/shar/zen-shar/server"
)

func TestHigherServerVersion(t *testing.T) {
	ss, ns, err := zenSvr.GetServers(4, nil, nil)
	natsURL := ns.GetEndPoint()
	require.NoError(t, err)
	defer ns.Shutdown()

	go ss.Listen()
	forcedVersion, err := version2.NewVersion("v1.0.100")
	require.NoError(t, err)
	cl := New(forceVersion{ver: forcedVersion, compatVer: forcedVersion})
	ctx := context.Background()
	err = cl.Dial(ctx, natsURL)
	require.Error(t, err)
}
