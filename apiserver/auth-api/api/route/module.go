package route

import "go.uber.org/fx"

// var Module = fx.Provide(New)
// Setting up the router -- Does not need to return anything
var Module = fx.Invoke(NewRouter)
