package router

import (
	"yalc/dbms/api/controller"
	"yalc/dbms/modules/echo"

	v4 "github.com/labstack/echo/v4"

	"go.uber.org/fx"
)

type (
	EchoRouter struct {
		Server *echo.EchoHTTPServer

		Controller controller.Controller
	}

	Params struct {
		fx.In

		Server     *echo.EchoHTTPServer
		Controller controller.Controller
	}
)

func NewEchoRouter(p Params) {
	// assert that the controller is of EchoController type
	cc, ok := p.Controller.(*controller.EchoController)
	if !ok {
		panic("injected Controller must be of type *controller.EchoController")
	}

	p.Server.AddGroup("/manage/projects/:projectId",
		func(g *v4.Group) {
			// list tables of project
			g.GET("/tables", func(c v4.Context) error {
				return cc.ListTables(c)
			})

			// create a new database for project
			g.POST("/databases", func(c v4.Context) error {
				return cc.CreateDatabase(c)
			})
		},
	)

	p.Server.AddGroup("/query/projects/:projectId",
		func(g *v4.Group) {
			// query the database
			//g.POST("/query", func(c v4.Context) error {
			//	//return cc.QueryDatabase(c)
			//})
		},
	)
}
