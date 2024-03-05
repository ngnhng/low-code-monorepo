package router

import (
	"yalc/bpmn-engine/controller"
	"yalc/bpmn-engine/modules/config"
	httpserver "yalc/bpmn-engine/modules/echo"

	echo "github.com/labstack/echo/v4"

	"go.uber.org/fx"
)

type (
	WorkflowRouterParams struct {
		fx.In

		Config config.Config
		Server *httpserver.EchoHTTPServer
		*controller.LaunchWorkflowController
		*controller.FetchWorkflowStatusController
	}
)

// InitWorkflowRouter initializes the workflow router.
//
// - POST /workflow
//   - Launches a new workflow
//   - Request: WorkflowLaunchRequest
//   - Response: 200 if successful or 400 if the request is invalid
func InitWorkflowRouter(p WorkflowRouterParams) {
	p.Server.AddGroup("/workflow", func(g *echo.Group) {
		g.POST("", p.LaunchWorkflowController.Execute)
		g.GET("/:id", p.FetchWorkflowStatusController.Fetch)
	},
	)
}
