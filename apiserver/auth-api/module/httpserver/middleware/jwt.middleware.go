package middleware

import (
	errorResponse "yalc/auth-service/domain/response/error"

	echojwt "github.com/labstack/echo-jwt/v4"
	"github.com/labstack/echo/v4"
)

// JwtMiddleware is a middleware that provides a JSON Web Token (JWT) authentication.
// For more information see https://echo.labstack.com/middleware/jwt.
func JWTMiddleware(secret string) echo.MiddlewareFunc {
	return echojwt.WithConfig(echojwt.Config{
		SigningKey: []byte(secret),
		ErrorHandler: func(c echo.Context, err error) error {
			return errorResponse.UnauthorizedError(
				c,
				errorResponse.AUTHENTICATION_FAILED_UNAUTHORIZED_MESSAGE,
				errorResponse.AUTHENTICATION_FAILED_UNAUTHORIZED_CODE,
			)
		},
	})
}
