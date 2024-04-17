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
	p.Server.AddGroup("/databases", func(g *v4.Group) {
		g.POST("", func(c v4.Context) error {
			return p.Controller.CreateDatabase(c)
		})
	})

	p.Server.AddGroup("/:projectId", func(g *v4.Group) {
		g.GET("/tables", func(c v4.Context) error {
			return p.Controller.ListTables(c)
		})
	})
}
