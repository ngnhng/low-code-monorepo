package middleware

import (
	error_response "yalc/auth-service/domain/response/error"

	"github.com/labstack/echo/v4"
)

func InvalidPathResponseFormatMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		// Call the next handler
		err := next(c)
		if err != nil {
			return error_response.DataNotFoundError(
				c,
				error_response.PATH_NOT_FOUND_MESSAGE,
				error_response.PATH_NOT_FOUND_CODE,
			)
		}

		return nil
	}
}
