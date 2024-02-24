package connector

import (
	user_connector "yalc/auth-service/connector/user"

	"go.uber.org/fx"
)

var Module = fx.Options(
	fx.Provide(user_connector.NewUserConnector),
)
