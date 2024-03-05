package controller

import (
	"yalc/bpmn-engine/domain/workflow"
	"yalc/bpmn-engine/usecase"

	"github.com/labstack/echo/v4"

	domain_error "yalc/bpmn-engine/domain/response/error"
)

type (
	Controller interface {
	}

	FetchGoogleSheetConfigController struct {
	}

	LaunchWorkflowController struct {
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

func NewLaunchWorkflowController() *LaunchWorkflowController {
	return &LaunchWorkflowController{}
}

func NewFetchWorkflowStatusController() *FetchWorkflowStatusController {
	return &FetchWorkflowStatusController{}
}

func NewStoreExecutionLogController() *StoreExecutionLogController {
	return &StoreExecutionLogController{}
}

// Execute is the method to execute the controller
func (ctrl *LaunchWorkflowController) Execute(c echo.Context) error {
	requestBody := c.Request().Body
	defer requestBody.Close()
	// bind and validate the request
	var req workflow.WorkflowLaunchRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(domain_error.BadRequestError("Malformed Request", "MALFORMED_REQUEST"))
	}
	if err := req.Validate(); err != nil {
		return c.JSON(domain_error.BadRequestError("Malformed Request", "MALFORMED_REQUEST"))
	}

	// execute the use case
	if err := ctrl.LaunchWorkflowUseCase.Execute(&req); err != nil {
		return c.JSON(domain_error.InternalServerError("Internal Server Error", "INTERNAL_SERVER_ERROR"))
	}

	return c.JSON(200, nil)
}

// Fetch is the method to fetch the workflow instance status
func (ctrl *FetchWorkflowStatusController) Fetch(c echo.Context) error {
	return nil
}
