package echo

import (
	"context"
	"yalc/dbms/modules/logger"

	"go.uber.org/fx"
)

var Module = fx.Module("echo-http",
	fx.Provide(
		NewEchoServer,
	),
	fx.Options(fx.Invoke(registerHooks)),
)

// hooks must not block to run long-running tasks synchronously
// hooks should schedule long-running tasks in background goroutines
// shutdown hooks should stop the background work started by startup hooks
func registerHooks(lc fx.Lifecycle, server *EchoHTTPServer, log logger.Logger) {
	lc.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			go func() {
				if err := server.Start(); err != nil {
					log.Fatal("Error starting Echo server", err)
				}
			}()
			return nil
		},
		OnStop: func(ctx context.Context) error {
			return server.Close()
		},
	})
}
