package main

import (
	"context"
	"os"
	"path/filepath"
	"yalc/bpmn-engine/controller"
	"yalc/bpmn-engine/modules/bpmn"
	"yalc/bpmn-engine/modules/config"
	"yalc/bpmn-engine/modules/echo"
	"yalc/bpmn-engine/modules/logger"
	"yalc/bpmn-engine/router"
	"yalc/bpmn-engine/usecase"

	"go.uber.org/fx"
)

func main() {

	app := fx.New(
		config.Module,
		logger.Module,
		echo.Module,
		bpmn.Module,
		usecase.Module,
		controller.Module,
		router.Module,

		//fx.Provide(
		//	usecase.NewGoogleSheetFn,
		//),

		//fx.Invoke(usecase.Fn),
		fx.Invoke(
			func(uc *usecase.GoogleSheetUseCase) {
				// Create a new function with the GoogleSheetUseCase as its dependency
				gsf := usecase.NewGoogleSheetFn(uc)

				// Assign the function to GoogleSheetFn
				usecase.GoogleSheetFnAssign(gsf)
			},
		),

		fx.Invoke(func(lc fx.Lifecycle, client *bpmn.SharClient, logger logger.Logger) {
			lc.Append(fx.Hook{
				OnStart: func(ctx context.Context) error {
					rootDir, err := os.Getwd()

					go func() {
						if err := client.Connect(); err != nil {
							logger.Fatal("Error while connecting to SHAR: ", err)
						}
						if err == nil {
							err = client.LoadServiceTaskSpec(
								client.GetConnCtx(),
								filepath.Join(rootDir, "service-tasks/google-sheet.task.yaml"),
								usecase.GoogleSheetFn,
							)
						}
						// TODO: error handling
					}()

					return nil
				},
				OnStop: func(ctx context.Context) error {
					return client.Close()
				},
			})
		}),
	)

	app.Run()
}
