package usecase

import (
	"go.uber.org/fx"
)

var Module = fx.Options(
	fx.Provide(
		NewGoogleOAuthLoginUsecase,
		NewGetGoogleOAuthTokenUsecase,
	),
)
