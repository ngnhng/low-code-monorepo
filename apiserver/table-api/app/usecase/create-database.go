package usecase

import (
	"fmt"
	"yalc/dbms/modules/config"
	"yalc/dbms/modules/logger"
	neonclient "yalc/dbms/modules/neon-client"
	"yalc/dbms/modules/pgx"
	"yalc/dbms/shared"

	"go.uber.org/fx"
)

type (
	CreateDatabaseUseCase struct {
		Config *config.Config
		Logger logger.Logger

		*neonclient.NeonClient
		*pgx.PgxManager
	}

	CreateDatabaseUseCaseParams struct {
		fx.In

		Config *config.Config
		Logger logger.Logger

		*neonclient.NeonClient
		*pgx.PgxManager
	}
)

func NewCreateDatabaseUseCase(p CreateDatabaseUseCaseParams) *CreateDatabaseUseCase {
	return &CreateDatabaseUseCase{
		Config:     p.Config,
		Logger:     p.Logger,
		NeonClient: p.NeonClient,
		PgxManager: p.PgxManager,
	}
}

func (uc *CreateDatabaseUseCase) Execute(ctx shared.RequestContext, projectId string) error {

	// check if database is already created
	// if it is, return an error
	// if not, create the database
	resp, err := uc.NeonClient.GetDatabaseDetails(shared.GenerateDatabaseName(projectId, ctx.GetUserId()))
	if err == nil {
		if resp.StatusCode == 200 {
			return fmt.Errorf("database already exists")
		}
	}

	// get the project info before creating the database
	//userDbPool, err := uc.PgxManager.GetOrCreateUserPgxPool()
	//if err != nil {
	//	uc.Logger.Debug("error getting user db pool: %v", err)
	//	return err
	//}
	//project, err := userDbPool.GetProjectInfo(ctx.GetContext(), projectId)
	//if err != nil {
	//	uc.Logger.Debug("error getting project info: %v", err)
	//	return err
	//}

	return uc.NeonClient.CreateDatabase(shared.GenerateDatabaseName(projectId, ctx.GetUserId()))
}
