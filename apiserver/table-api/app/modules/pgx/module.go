package pgx

import "go.uber.org/fx"

var Module = fx.Module(
	"pgx",
	fx.Provide(
		NewPgxManager,
	),
)
