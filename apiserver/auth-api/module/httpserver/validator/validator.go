package validator

import (
	"fmt"
	"net/http"

	response_error "yalc/auth-service/domain/response/error"

	"github.com/go-playground/validator"
	"github.com/labstack/echo/v4"
)

type (
	CustomValidator struct {
		validator *validator.Validate
	}
)

func NewValidator() *CustomValidator {
	return &CustomValidator{validator: validator.New()}
}

func (cv *CustomValidator) Validate(i interface{}) error {
	if err := cv.validator.Struct(i); err != nil {
		// Optionally, you could return the error to give each route more control over the status code
		return echo.NewHTTPError(
			http.StatusBadRequest,
			response_error.NewBadRequestResponse(
				"Payload validation failed", fmt.Sprintf("%v", err),
			))
	}
	return nil
}
