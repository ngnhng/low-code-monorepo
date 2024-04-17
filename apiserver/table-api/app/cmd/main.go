package main

import (
	"yalc/dbms/api/controller"
	"yalc/dbms/api/router"
	"yalc/dbms/modules/config"
	"yalc/dbms/modules/echo"
	"yalc/dbms/modules/logger"
	neonclient "yalc/dbms/modules/neon-client"
	"yalc/dbms/modules/pgx"
	"yalc/dbms/usecase"

	fx "go.uber.org/fx"
)

func main() {

	core := fx.Options(
		config.Module,
		logger.Module,
	)

	app := fx.New(
		core,
		echo.Module,
		neonclient.Module,
		pgx.Module,
		usecase.Module,
		controller.Module,
		router.Module,
	)

	app.Run()
}
