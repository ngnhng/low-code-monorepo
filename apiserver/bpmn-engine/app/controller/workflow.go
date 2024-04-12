package controller

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
	"yalc/bpmn-engine/domain"
	"yalc/bpmn-engine/domain/workflow"
	"yalc/bpmn-engine/modules/logger"
	"yalc/bpmn-engine/usecase"

	"github.com/labstack/echo/v4"
	"go.uber.org/fx"

	domain_error "yalc/bpmn-engine/domain/response/error"
)

type (
	WorkflowController struct {
		logger logger.Logger

		usecase.LaunchWorkflowUseCase
		*usecase.FetchWorkflowStatusUseCase
		*usecase.CompleteUserTaskUseCase
	}

	WorkflowControllerParams struct {
		fx.In

		Logger logger.Logger
		usecase.LaunchWorkflowUseCase
		*usecase.FetchWorkflowStatusUseCase
		*usecase.CompleteUserTaskUseCase
	}
)

func NewWorkflowController(p WorkflowControllerParams) *WorkflowController {
	return &WorkflowController{
		logger:                     p.Logger,
		LaunchWorkflowUseCase:      p.LaunchWorkflowUseCase,
		FetchWorkflowStatusUseCase: p.FetchWorkflowStatusUseCase,
		CompleteUserTaskUseCase:    p.CompleteUserTaskUseCase,
	}
}

// Execute is the method to execute the controller
func (ctrl *WorkflowController) Execute(c echo.Context) (err error) {
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

	ctrl.logger.Debug("Request received: ", req)

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
// TODO: have not check user correlation with ids
func (ctrl *WorkflowController) FetchInstanceLog(c echo.Context) error {
	// set SSE related headers
	c.Response().Header().Set("Content-Type", "text/event-stream")
	// no-cache means that the browser should not cache the response
	c.Response().Header().Set("Cache-Control", "no-cache")
	// keep-alive means that the connection should be kept alive
	c.Response().Header().Set("Connection", "keep-alive")

	ctrl.logger.Debug("FetchWorkflowStatusController.Fetch")
	workflowID := c.Param("id")
	ctrl.logger.Debug("Workflow ID: ", workflowID)

	ctx := c.Request().Context()
	//ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	//defer cancel()

	ctx = context.WithValue(ctx, domain.UserKey, c.Get("user"))

	statusCh := make(chan *workflow.WorkflowStatusResponse)
	errCh := make(chan error)

	//status, err := ctrl.FetchWorkflowStatusUseCase.FetchWorkflowStatus(ctx, workflowID)
	//if err != nil {
	//	ctrl.logger.Error("Error fetching workflow status", "err", err)
	//	return c.JSON(domain_error.InternalServerError("Internal Server Error", "INTERNAL_SERVER_ERROR"))
	//}
	//return c.JSON(200, status)

	go ctrl.FetchWorkflowStatusUseCase.FetchWorkflowStatus(ctx, workflowID, statusCh, errCh)

	for {
		select {
		case err, ok := <-errCh:
			if ok {
				// A value was received from the channel
				if err != nil {
					// An error occurred, handle it
					ctrl.logger.Error("Error fetching workflow status: ", "err: ", err)
					return c.JSON(domain_error.InternalServerError("Internal Server Error", "INTERNAL_SERVER_ERROR"))
				}
			}
		case status, ok := <-statusCh:
			if !ok {
				// statusCh was closed, so return from the function
				return c.JSON(http.StatusGone, nil)
			}
			sb := strings.Builder{}
			sb.WriteString(fmt.Sprintf("event: %s-status\n", workflowID))
			// stringify the status
			statusJSON, _ := json.Marshal(status)
			sb.WriteString(fmt.Sprintf("data: %s\n\n", statusJSON))
			event := sb.String()
			fmt.Fprint(c.Response(), event)
			c.Response().Flush()

		case <-c.Request().Context().Done():
			ctrl.logger.Debug("Context cancelled")
			return c.JSON(http.StatusGone, nil)
		}
	}
}

// CompleteUserTask is the method to complete a user task
func (ctrl *WorkflowController) CompleteUserTask(c echo.Context) error {
	ctrl.logger.Debug("CompleteUserTaskController.Complete")
	trackingID := c.Param("trackingId")
	ctrl.logger.Debug("Tracking ID: ", trackingID)

	var req workflow.CompleteUserTaskRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(domain_error.BadRequestError("Malformed Request", "MALFORMED_REQUEST"))
	}

	ctx := c.Request().Context()
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	ctx = context.WithValue(ctx, domain.UserKey, c.Get("user"))

	vars, err := ctrl.CompleteUserTaskUseCase.Execute(ctx, trackingID, req)
	if err != nil {
		ctrl.logger.Error("Error completing user task", "err", err)
		return c.JSON(domain_error.InternalServerError("Internal Server Error", "INTERNAL_SERVER_ERROR"))
	}
	return c.JSON(200, workflow.CompleteUserTaskResponse{Vars: vars})
}
