package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"yalc/bpmn-engine/controller"
	"yalc/bpmn-engine/modules/bpmn"
	"yalc/bpmn-engine/modules/config"
	"yalc/bpmn-engine/modules/echo"
	"yalc/bpmn-engine/modules/logger"
	"yalc/bpmn-engine/router"
	servicetasks "yalc/bpmn-engine/service-tasks"
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
				gsf := usecase.NewGoogleSheetReadSingleRangeFn(uc)

				// Assign the function to GoogleSheetFn
				usecase.GoogleSheetReadSingleRangeFnAssign(gsf)
			},
			func(uc *usecase.GoogleSheetUseCase) {
				// Create a new function with the GoogleSheetUseCase as its dependency
				gsf := usecase.NewGoogleSheetWriteAppendFn(uc)

				// Assign the function to GoogleSheetFn
				usecase.GoogleSheetWriteAppendFnAssign(gsf)
			},
		),

		fx.Invoke(func(lc fx.Lifecycle, client *bpmn.SharClient, logger logger.Logger) {
			lc.Append(fx.Hook{
				OnStart: func(ctx context.Context) error {
					rootDir, err := os.Getwd()
					if err != nil {
						logger.Fatal("Error: ", err)
					}

					go func() {
						if err := connectAndLoadSpec(client, logger, rootDir); err != nil {
							logger.Fatal("Error: ", err)
						}
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

func connectAndLoadSpec(client *bpmn.SharClient, logger logger.Logger, rootDir string) error {
	if err := client.Connect(); err != nil {
		return fmt.Errorf("error connecting to SHAR: %w", err)
	}

	err := client.LoadServiceTaskSpecFromFile(
		client.GetConnCtx(),
		filepath.Join(rootDir, "service-tasks/google-sheet-read-single-range.task.yaml"),
		usecase.GoogleSheetReadSingleRangeFn,
	)
	if err != nil {
		return fmt.Errorf("error loading service task spec: %w", err)
	}

	err = client.LoadServiceTaskSpecFromFile(
		client.GetConnCtx(),
		filepath.Join(rootDir, "service-tasks/test-log.task.yaml"),
		bpmn.TestLogServiceFn,
	)
	if err != nil {
		return fmt.Errorf("error loading service task spec: %w", err)
	}

	err = client.LoadServiceTaskSpec(
		client.GetConnCtx(),
		servicetasks.GoogleSheetWriteAppendTaskSpec,
		usecase.GoogleSheetWriteAppendFn,
	)

	if err != nil {
		return fmt.Errorf("error loading service task spec: %w", err)
	}

	return nil
}
