package usecase

import "go.uber.org/fx"

var Module = fx.Options(
	fx.Provide(
		NewLaunchWorkflowUseCase,
		NewGoogleSheetUseCase,
		NewFetchWorkflowStatusUseCase,
		NewCompleteUserTaskUseCase,
		NewFetchWorkflowStatusUseCaseV2,
		NewTableQueryUseCase,
	),
)

var _ LaunchWorkflowUseCase = (*launchWorkflowUseCase)(nil)
