package usecase

import "go.uber.org/fx"

var Module = fx.Module(
	"usecase",
	fx.Provide(
		NewCreateDatabaseUseCase,
		NewCreateTableUseCase,
		NewGetTablesInfoFromDatabaseUseCase,
		NewGetTableDataUseCase,
		NewInsertRowUseCase,
		NewUpdateRowUseCase,
		NewDeleteRowUseCase,
		NewCreateColumnUseCase,
		NewDeleteColumnUseCase,
		NewDeleteTableUseCase,
	),
)
