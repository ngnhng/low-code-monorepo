package error

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func UnauthorizedError(c echo.Context, message string, err string) error {
	return c.JSON(http.StatusUnauthorized, NewUnauthorizedResponse(message, err))
}

func InternalServerError(c echo.Context, message string, err string) error {
	return c.JSON(http.StatusInternalServerError, NewInternalServerErrorResponse(message, err))
}

func BadRequestError(c echo.Context, message string, err string) error {
	return c.JSON(http.StatusBadRequest, NewBadRequestResponse(message, err))
}

func DataNotFoundError(c echo.Context, message string, err string) error {
	return c.JSON(http.StatusNotFound, NewDataNotFoundResponse(message, err))
}
