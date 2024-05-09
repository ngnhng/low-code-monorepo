package neonclient

import "go.uber.org/fx"

var Module = fx.Module(
	"neon-client",
	fx.Provide(NewClient),
)
