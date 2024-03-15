package usecase

import "go.uber.org/fx"

var Module = fx.Options(
	fx.Provide(
		NewLaunchWorkflowUseCase,
		NewGoogleSheetUseCase,
	),
)

var _ LaunchWorkflowUseCase = (*launchWorkflowUseCase)(nil)
