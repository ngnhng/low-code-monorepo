package controller

import (
	"errors"
	"yalc/dbms/modules/config"
	"yalc/dbms/modules/echo"
	"yalc/dbms/modules/logger"
	"yalc/dbms/usecase"

	v4 "github.com/labstack/echo/v4"
	"go.uber.org/fx"
)

type (
	EchoController struct {
		Config *config.Config
		Logger logger.Logger

		CreateDatabaseUC *usecase.CreateDatabaseUseCase
		ListTablesUC     *usecase.GetTablesInfoFromDatabaseUseCase
	}

	Params struct {
		fx.In

		Config           *config.Config
		Logger           logger.Logger
		CreateDatabaseUC *usecase.CreateDatabaseUseCase
	}
)

func NewEchoController(p Params) *EchoController {
	return &EchoController{
		Config:           p.Config,
		Logger:           p.Logger,
		CreateDatabaseUC: p.CreateDatabaseUC,
	}
}

func (ec *EchoController) CreateDatabase(args ...interface{}) error {
	if len(args) == 0 {
		return errors.New("no arguments provided")
	}

	c, ok := args[0].(v4.Context)
	if !ok {
		return errors.New("first argument is not of type echo.Context")
	}

	cc, ok := c.(*echo.EchoContext)
	if !ok {
		return errors.New("context is not of type *echo.EchoContext")
	}

	dbName := c.QueryParam("name")

	// call usecase
	err := ec.CreateDatabaseUC.Execute(cc, dbName)
	if err != nil {
		return err
	}

	return c.JSON(200, "Database created")
}

func (ec *EchoController) ListTables(args ...interface{}) error {
	if len(args) == 0 {
		return errors.New("no arguments provided")
	}

	c, ok := args[0].(v4.Context)
	if !ok {
		return errors.New("first argument is not of type echo.Context")
	}

	cc, ok := c.(*echo.EchoContext)
	if !ok {
		return errors.New("context is not of type *echo.EchoContext")
	}

	projectId := c.Param("projectId")

	// call usecase
	tables, err := ec.ListTablesUC.Execute(cc, projectId)
	if err != nil {
		return err
	}

	return c.JSON(200, tables)
}
