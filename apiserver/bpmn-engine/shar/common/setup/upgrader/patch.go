package upgrader

import (
	"context"
	"fmt"
	"github.com/hashicorp/go-version"
	"github.com/nats-io/nats.go"
	"gitlab.com/shar-workflow/shar/common"
	"log/slog"
	"reflect"
	"runtime"
	"strings"
)

type patch func(ctx context.Context, nc common.NatsConn, js nats.JetStreamContext) error

/*
To create a version patch, first add a patch function go file,
in the format vMM_mm_rrrr.go (the function name should match the file name).
and then include the function in the list below.
Always add the latest version at the bottom of the list.
*/
var list = []patch{
	v1_1_503,
}

var nver int
var versions = make([]*version.Version, 0, len(list))

func init() {
	for _, i := range list {
		f := runtime.FuncForPC(reflect.ValueOf(i).Pointer()).Name()
		v := strings.Replace(f[strings.LastIndex(f, ".")+1:], "_", ".", -1)
		ver, err := version.NewVersion(v)
		if err != nil {
			panic(fmt.Errorf("broken version descriptor %s: %w", v, err))
		}
		versions = append(versions, ver)
	}
	nver = len(list)
}

// IsCompatible returns true if the server compatible version is compatible with a client expected compatible version.
func IsCompatible(v *version.Version) (bool, *version.Version) {
	minVersion := GetCompatibleVersion()
	if minVersion == nil {
		minVersion = v
	}
	return minVersion.Equal(v), minVersion
}

// GetCompatibleVersion gets the lowest compatible version number for this package
func GetCompatibleVersion() *version.Version {
	var minVersion *version.Version
	lastv := nver - 1
	for i := 0; i < len(versions); i++ {
		test := versions[lastv-i]
		if minVersion == nil || test.GreaterThan(minVersion) {
			minVersion = test
		} else if test.LessThan(minVersion) {
			break
		}
	}
	return minVersion
}

// Patch cycles through all available upgrades and applies them in order.  Only the upgrades greater than the deployed version will be executed.
func Patch(ctx context.Context, fromVersion string, n common.NatsConn, j nats.JetStreamContext) error {
	v1, err := version.NewVersion(fromVersion)
	if err != nil {
		return fmt.Errorf("reading target version from '%s': %w", fromVersion, err)
	}
	for _, i := range list {
		fname := runtime.FuncForPC(reflect.ValueOf(i).Pointer()).Name()
		v := strings.Replace(fname[strings.LastIndex(fname, ".")+1:], "_", ".", -1)
		v2, err := version.NewVersion(v)
		if err != nil {
			return fmt.Errorf("reading patch version from '%s': %w", fromVersion, err)
		}
		if v2.GreaterThan(v1) {
			slog.Info("Patching SHAR data to v" + v2.String())
			if err := i(ctx, n, j); err != nil {
				return fmt.Errorf("patching %s: %w", v2.String(), err)
			}
		}
	}
	return nil
}
