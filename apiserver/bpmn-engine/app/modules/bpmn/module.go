package bpmn

import "go.uber.org/fx"

var Module = fx.Module(
	"bpmn",
	fx.Provide(
		NewSharClient,
	),
)
