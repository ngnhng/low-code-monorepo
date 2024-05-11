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

	p.Server.AddGroup("/projects/:projectId",
		func(g *v4.Group) {

			manageSubGroup := g.Group("/manage")

			// list tables of project
			manageSubGroup.GET("/tables", func(c v4.Context) error {
				return cc.ListTables(c)
			})

			manageSubGroup.GET("/tables/:tableId", func(c v4.Context) error {
				return cc.GetTableInfo(c)
			})

			// create a new table for project
			manageSubGroup.POST("/tables", func(c v4.Context) error {
				return cc.CreateTable(c)
			})

			// delete a table
			manageSubGroup.DELETE("/tables/:tableId", func(c v4.Context) error {
				return cc.DeleteTable(c)
			})

			// create a new database for project
			manageSubGroup.POST("/databases", func(c v4.Context) error {
				return cc.CreateDatabase(c)
			})
		},
	)

	p.Server.AddGroup("/projects/:projectId/tables/:tableId",
		func(g *v4.Group) {
			// read all data from table, with optional pagination
			// e.g. /projects/1/tables/1/query/?limit=10&offset=0
			g.POST("/query", func(c v4.Context) error {
				return cc.QueryTable(c)
			})

			// add rows
			g.POST("/rows", func(c v4.Context) error {
				return cc.InsertRow(c)
			})

			// update rows
			g.PATCH("/rows", func(c v4.Context) error {
				return cc.UpdateRow(c)
			})

			// delete rows
			g.DELETE("/rows", func(c v4.Context) error {
				return cc.DeleteRow(c)
			})

			// new column
			g.POST("/columns", func(c v4.Context) error {
				return cc.CreateColumn(c)
			})

			// delete column
			g.DELETE("/columns", func(c v4.Context) error {
				return cc.DeleteColumn(c)
			})

			//// update column
			//g.PATCH("/columns/:columnId", func(c v4.Context) error {
			//	return cc.UpdateColumn(c)
			//})
		},
	)
}
