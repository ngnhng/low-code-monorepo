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

	cc := &echo.EchoContext{
		Context: c,
	}

	// TODO: move to domain and add validation
	var body struct {
		Name string `json:"name"`
	}

	// get database name from request body
	if err := c.Bind(&body); err != nil {
		return err
	}

	// call usecase
	err := ec.CreateDatabaseUC.Execute(cc, body.Name)
	if err != nil {
		return err
	}

	return c.JSON(201, "Database created")
}

func (ec *EchoController) ListTables(args ...interface{}) error {
	if len(args) == 0 {
		return errors.New("no arguments provided")
	}

	c, ok := args[0].(v4.Context)
	if !ok {
		return errors.New("first argument is not of type echo.Context")
	}

	cc := &echo.EchoContext{
		Context: c,
	}

	projectId := c.Param("projectId")

	// call usecase
	tables, err := ec.ListTablesUC.Execute(cc, projectId)
	if err != nil {
		return err
	}

	return c.JSON(200, tables)
}
