package usecase

import (
	"yalc/dbms/modules/config"
	"yalc/dbms/modules/logger"
	neonclient "yalc/dbms/modules/neon-client"
	"yalc/dbms/shared"
)

type (
	CreateDatabaseUseCase struct {
		Config *config.Config
		Logger logger.Logger

		*neonclient.NeonClient
	}

	CreateDatabaseUseCaseParams struct {
		Config *config.Config
		Logger logger.Logger

		*neonclient.NeonClient
	}
)

func NewCreateDatabaseUseCase(p CreateDatabaseUseCaseParams) *CreateDatabaseUseCase {
	return &CreateDatabaseUseCase{
		Config:     p.Config,
		Logger:     p.Logger,
		NeonClient: p.NeonClient,
	}
}

func (uc *CreateDatabaseUseCase) Execute(ctx shared.RequestContext, name string) error {
	return uc.NeonClient.CreateDatabase(name)
}
