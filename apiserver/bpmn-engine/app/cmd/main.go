package main

import (
	"yalc/bpmn-engine/controller"
	"yalc/bpmn-engine/modules/bpmn"
	"yalc/bpmn-engine/modules/config"
	"yalc/bpmn-engine/modules/echo"
	"yalc/bpmn-engine/modules/logger"
	"yalc/bpmn-engine/router"

	"go.uber.org/fx"
)

func main() {

	app := fx.New(
		config.Module,
		logger.Module,
		echo.Module,
		router.Module,
		controller.Module,
		bpmn.Module,
	)

	app.Run()
}
