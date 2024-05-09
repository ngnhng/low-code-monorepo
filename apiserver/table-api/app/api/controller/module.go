package controller

import "go.uber.org/fx"

var Module = fx.Module(
	"controller",
	fx.Provide(
		fx.Annotate(
			NewEchoController,
			fx.As(new(Controller)),
		),
	),
)
