package controller

import (
	"context"
	"yalc/bpmn-engine/domain"
	"yalc/bpmn-engine/domain/workflow"
	"yalc/bpmn-engine/modules/logger"
	"yalc/bpmn-engine/usecase"

	"github.com/labstack/echo/v4"
	"go.uber.org/fx"

	domain_error "yalc/bpmn-engine/domain/response/error"
)

type (
	Controller interface {
	}

	FetchGoogleSheetConfigController struct {
	}

	LaunchWorkflowController struct {
		logger logger.Logger
		usecase.LaunchWorkflowUseCase
	}

	LaunchWorkflowControllerParams struct {
		fx.In

		logger.Logger
		usecase.LaunchWorkflowUseCase
	}

	FetchWorkflowStatusController struct {
	}

	StoreExecutionLogController struct {
	}
)

func NewFetchGoogleSheetConfigController() *FetchGoogleSheetConfigController {
	return &FetchGoogleSheetConfigController{}
}

func NewLaunchWorkflowController(p LaunchWorkflowControllerParams) *LaunchWorkflowController {
	return &LaunchWorkflowController{
		logger:                p.Logger,
		LaunchWorkflowUseCase: p.LaunchWorkflowUseCase,
	}
}

func NewFetchWorkflowStatusController() *FetchWorkflowStatusController {
	return &FetchWorkflowStatusController{}
}

func NewStoreExecutionLogController() *StoreExecutionLogController {
	return &StoreExecutionLogController{}
}

// Execute is the method to execute the controller
func (ctrl *LaunchWorkflowController) Execute(c echo.Context) (err error) {
	ctrl.logger.Debug("LaunchWorkflowController.Execute")
	requestBody := c.Request().Body
	defer requestBody.Close()
	// bind and validate the request
	var req workflow.WorkflowLaunchRequest
	if err = c.Bind(&req); err != nil {
		return c.JSON(domain_error.BadRequestError("Malformed Request", "MALFORMED_REQUEST"))
	}
	if err = req.Validate(); err != nil {
		return c.JSON(domain_error.BadRequestError("Malformed Request", "MALFORMED_REQUEST"))
	}

	//ctrl.logger.Debug("Request received: ", req)
	ctrl.logger.Debug("Check nil of LaunchWorkflowUseCase: ", ctrl.LaunchWorkflowUseCase)

	// execute the use case
	ctrl.logger.Debug("Controller Context:", c)
	ctx := c.Request().Context()
	ctx = context.WithValue(ctx, domain.UserKey, c.Get("user"))
	launchStatus := &workflow.LaunchStatus{}
	if launchStatus, err = ctrl.LaunchWorkflowUseCase.Execute(ctx, &req); err != nil {
		return c.JSON(domain_error.InternalServerError("Internal Server Error", "INTERNAL_SERVER_ERROR"))
	}

	return c.JSON(200, launchStatus)
}

// Fetch is the method to fetch the workflow instance status
func (ctrl *FetchWorkflowStatusController) Fetch(c echo.Context) error {
	return nil
}
