package bpmn

import (
	"go.uber.org/fx"
)

var Module = fx.Module(
	"bpmn",
	fx.Provide(
		NewSharClient,
	),
	//fx.Options(fx.Invoke(registerHooks)),
)

//func registerHooks(lc fx.Lifecycle, client *SharClient, logger logger.Logger) {
//	lc.Append(fx.Hook{
//		OnStart: func(ctx context.Context) error {
//			go func() {
//				if err := client.Connect(); err != nil {
//					logger.Fatal("Error while connecting to SHAR: ", err)
//				}
//			}()
//			return nil
//		},
//		OnStop: func(ctx context.Context) error {
//			return client.Close()
//		},
//	})
//}
