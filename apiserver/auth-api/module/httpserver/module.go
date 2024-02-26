package httpserver

import (
	"context"

	"yalc/auth-service/module/logger"
	"yalc/auth-service/shared/constant"

	"go.uber.org/fx"
)

var Module = fx.Module(constant.HTTPSERVER_MODULE,
	fx.Provide(
		fx.Annotate(
			NewEchoServer,
			fx.As(new(EchoHTTPServer)),
		),
	),
	fx.Options(fx.Invoke(registerHooks)),
)

// hooks must not block to run long-running tasks synchronously
// hooks should schedule long-running tasks in background goroutines
// shutdown hooks should stop the background work started by startup hooks
func registerHooks(lc fx.Lifecycle, server EchoHTTPServer, log logger.Logger) {
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
