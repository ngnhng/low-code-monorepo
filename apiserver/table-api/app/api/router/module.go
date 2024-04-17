package router

import "go.uber.org/fx"

// Router is the outermost module for the app
// No need for abstraction to interface since no other module will use this
var Module = fx.Invoke(
	NewEchoRouter,
)
