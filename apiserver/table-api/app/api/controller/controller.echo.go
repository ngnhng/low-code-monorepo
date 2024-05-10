package controller

import (
	"errors"
	"strconv"
	"yalc/dbms/domain"
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
		CreateTableUC    *usecase.CreateTableUseCase
		ListTablesUC     *usecase.GetTablesInfoFromDatabaseUseCase
		GetTableDataUC   *usecase.GetTableDataUseCase
		InsertRowUC      *usecase.InsertRowUseCase
		UpdateRowUC      *usecase.UpdateRowUseCase
		DeleteRowUC      *usecase.DeleteRowUseCase
		CreateColumnUC   *usecase.CreateColumnUseCase
		DeleteColumnUC   *usecase.DeleteColumnUseCase
		DeleteTableUC    *usecase.DeleteTableUseCase
		GetTableInfoUC   *usecase.GetTableInfoUseCase
	}

	Params struct {
		fx.In

		Config           *config.Config
		Logger           logger.Logger
		CreateDatabaseUC *usecase.CreateDatabaseUseCase
		CreateTableUC    *usecase.CreateTableUseCase
		ListTablesUC     *usecase.GetTablesInfoFromDatabaseUseCase
		GetTableDataUC   *usecase.GetTableDataUseCase
		AddRowsUC        *usecase.InsertRowUseCase
		UpdateRowUC      *usecase.UpdateRowUseCase
		DeleteRowUC      *usecase.DeleteRowUseCase
		CreateColumnUC   *usecase.CreateColumnUseCase
		DeleteColumnUC   *usecase.DeleteColumnUseCase
		DeleteTableUC    *usecase.DeleteTableUseCase
		GetTableInfoUC   *usecase.GetTableInfoUseCase
	}
)

func NewEchoController(p Params) *EchoController {
	return &EchoController{
		Config:           p.Config,
		Logger:           p.Logger,
		CreateDatabaseUC: p.CreateDatabaseUC,
		CreateTableUC:    p.CreateTableUC,
		ListTablesUC:     p.ListTablesUC,
		GetTableDataUC:   p.GetTableDataUC,
		InsertRowUC:      p.AddRowsUC,
		UpdateRowUC:      p.UpdateRowUC,
		DeleteRowUC:      p.DeleteRowUC,
		CreateColumnUC:   p.CreateColumnUC,
		DeleteColumnUC:   p.DeleteColumnUC,
		DeleteTableUC:    p.DeleteTableUC,
		GetTableInfoUC:   p.GetTableInfoUC,
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

	// project id
	projectId := c.Param("projectId")

	// TODO: check project validity

	// call usecase
	err := ec.CreateDatabaseUC.Execute(cc, projectId)
	if err != nil {
		return err
	}

	return c.JSON(201, "Database created")
}

func (ec *EchoController) CreateTable(args ...interface{}) error {
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

	// project id
	projectId := c.Param("projectId")

	// TODO: check project validity
	// query to store to check if the project exists

	// body
	payload := &domain.CreateTableRequest{}
	// parse body
	if err := cc.Bind(payload); err != nil {
		ec.Logger.Errorf("failed to bind payload: %v", err)
		return err
	}
	if err := cc.Validate(payload); err != nil {
		ec.Logger.Errorf("failed to validate payload: %v", err)
		return err
	}

	ec.Logger.Debugf("payload: %+v", payload)

	// call usecase
	table, err := ec.CreateTableUC.Execute(
		cc,
		projectId,
		&payload.Table,
	)
	if err != nil {
		resp := domain.ErrorResponse{
			Message: err.Error(),
		}
		return c.JSON(400, resp)
	}

	return c.JSON(201, table)
}

func (ec *EchoController) DeleteTable(args ...interface{}) error {
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
	tableId := c.Param("tableId")

	err := ec.DeleteTableUC.Execute(
		cc,
		projectId,
		tableId,
	)

	if err != nil {
		resp := domain.ErrorResponse{
			Message: err.Error(),
		}
		return c.JSON(400, resp)
	}

	return c.JSON(201, "Table deleted")
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

	// TODO: check project validity

	// call usecase
	tables, err := ec.ListTablesUC.Execute(cc, projectId)
	if err != nil {
		resp := domain.ErrorResponse{
			Message: err.Error(),
		}
		return c.JSON(400, resp)
	}

	// after getting the tables, we need to map the column id with the label name

	return c.JSON(200, tables)
}

func (ec *EchoController) QueryTable(args ...interface{}) error {
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
	tableId := c.Param("tableId")

	limitStr := c.QueryParam("limit")
	offsetStr := c.QueryParam("offset")

	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = domain.DefaultQueryLimit
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil {
		offset = domain.DefaultQueryOffset
	}

	body := &domain.Query{}
	if err := cc.Bind(body); err != nil {
		ec.Logger.Errorf("failed to bind body: %v", err)
		defaultQuery := domain.DefaultQuery
		body = &defaultQuery
	}

	result, err := ec.GetTableDataUC.ExecuteV2(
		cc,
		projectId,
		tableId,
		body,
		limit,
		offset,
	)
	if err != nil {
		resp := domain.ErrorResponse{
			Message: err.Error(),
		}
		return c.JSON(400, resp)
	}

	return c.JSON(200, result)
}

func (ec *EchoController) InsertRow(args ...interface{}) error {
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
	tableId := c.Param("tableId")

	payload := &domain.InsertRowRequestV2{}
	if err := cc.Bind(payload); err != nil {
		ec.Logger.Errorf("failed to bind body: %v", err)
		return err
	}

	if err := cc.Validate(payload); err != nil {
		ec.Logger.Errorf("failed to validate body: %v", err)
		return err
	}

	//ec.Logger.Debugf("payload: %+v", payload)
	//ec.Logger.Debugf("projectId: %s, tableId: %s", projectId, tableId)

	err := ec.InsertRowUC.ExecuteV2(
		cc,
		projectId,
		tableId,
		payload,
	)
	if err != nil {
		resp := domain.ErrorResponse{
			Message: err.Error(),
		}
		return c.JSON(400, resp)
	}

	return c.JSON(201, "Rows added")
}

func (ec *EchoController) UpdateRow(args ...interface{}) error {
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
	tableId := c.Param("tableId")

	payload := &domain.UpdateRowRequestV2{}
	if err := cc.Bind(payload); err != nil {
		ec.Logger.Errorf("failed to bind body: %v", err)
		return err
	}

	//ec.Logger.Debugf("payload: %+v", payload)
	//ec.Logger.Debugf("projectId: %s, tableId: %s", projectId, tableId)

	err := ec.UpdateRowUC.ExecuteV2(
		cc,
		projectId,
		tableId,
		payload,
	)
	if err != nil {
		resp := domain.ErrorResponse{
			Message: err.Error(),
		}
		return c.JSON(400, resp)
	}

	return c.JSON(201, "Rows updated")
}

func (ec *EchoController) DeleteRow(args ...interface{}) error {
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
	tableId := c.Param("tableId")

	payload := &domain.DeleteRowRequest{}
	if err := cc.Bind(payload); err != nil {
		ec.Logger.Errorf("failed to bind body: %v", err)
		return err
	}

	if err := cc.Validate(payload); err != nil {
		ec.Logger.Errorf("failed to validate body: %v", err)
		return err
	}

	//ec.Logger.Debugf("payload: %+v", payload)
	//ec.Logger.Debugf("projectId: %s, tableId: %s", projectId, tableId)

	err := ec.DeleteRowUC.ExecuteV2(
		cc,
		projectId,
		tableId,
		payload,
	)
	if err != nil {
		resp := domain.ErrorResponse{
			Message: err.Error(),
		}
		return c.JSON(400, resp)
	}

	return c.JSON(201, "Rows deleted")
}

func (ec *EchoController) CreateColumn(args ...interface{}) error {
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
	tableId := c.Param("tableId")

	payload := &domain.CreateColumnRequest{}
	if err := cc.Bind(payload); err != nil {
		ec.Logger.Errorf("failed to bind body: %v", err)
		return err
	}

	if err := cc.Validate(payload); err != nil {
		ec.Logger.Errorf("failed to validate body: %v", err)
		return err
	}

	ec.Logger.Debugf("payload: %+v", payload)
	ec.Logger.Debugf("projectId: %s, tableId: %s", projectId, tableId)

	table, err := ec.CreateColumnUC.ExecuteV2(
		cc,
		projectId,
		tableId,
		payload,
	)
	if err != nil {
		resp := domain.ErrorResponse{
			Message: err.Error(),
		}
		return c.JSON(400, resp)
	}

	return c.JSON(201, table)
}

func (ec *EchoController) DeleteColumn(args ...interface{}) error {
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
	tableId := c.Param("tableId")

	payload := &domain.DeleteColumnRequest{}
	if err := cc.Bind(payload); err != nil {
		ec.Logger.Errorf("failed to bind body: %v", err)
		return err
	}

	if err := cc.Validate(payload); err != nil {
		ec.Logger.Errorf("failed to validate body: %v", err)
		return err
	}

	ec.Logger.Debugf("payload: %+v", payload)
	ec.Logger.Debugf("projectId: %s, tableId: %s", projectId, tableId)

	err := ec.DeleteColumnUC.Execute(
		cc,
		projectId,
		tableId,
		payload,
	)
	if err != nil {
		resp := domain.ErrorResponse{
			Message: err.Error(),
		}
		return c.JSON(400, resp)
	}

	return c.JSON(201, "Column deleted")
}

func (ec *EchoController) GetTableInfo(args ...interface{}) error {
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
	tableId := c.Param("tableId")

	table, err := ec.GetTableInfoUC.Execute(
		cc,
		projectId,
		tableId,
	)

	if err != nil {
		resp := domain.ErrorResponse{
			Message: err.Error(),
		}
		return c.JSON(400, resp)
	}

	return c.JSON(200, table)
}
