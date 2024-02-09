package main

import (
	"yalc/auth-service/module/config"
	"yalc/auth-service/module/core"
	redis_db "yalc/auth-service/module/database/redis"
	"yalc/auth-service/module/logger"

	"go.uber.org/fx"
)

func main() {

	// env is read from os env
	//configs, err := config.NewConfig()
	//if err != nil {
	//	panic(err)
	//}
	// we could provide config here but we wont be able to use it in getModule()
	app := fx.New(
		//core.GetModule(configs),
		logger.Module,
		config.Module,
		core.GetModule(),
		// provide db as a separate module
		redis_db.Module,
	)
	app.Run()
}
