package core

import (
	"yalc/auth-service/api/controller"
	"yalc/auth-service/api/route"
	"yalc/auth-service/module/httpserver"
	"yalc/auth-service/repository"
	"yalc/auth-service/usecase"

	"go.uber.org/fx"
)

func GetModule() fx.Option {
	return fx.Options(
		controller.Module,
		repository.Module,
		usecase.Module,
		httpserver.Module,
		route.Module,
	)
}
