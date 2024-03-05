package error

import (
	"net/http"
)

func UnauthorizedError(message string, err string) (int, any) {
	return http.StatusUnauthorized, NewUnauthorizedResponse(message, err)
}

func InternalServerError(message string, err string) (int, any) {
	return http.StatusInternalServerError, NewInternalServerErrorResponse(message, err)
}

func BadRequestError(message string, err string) (int, any) {
	return http.StatusBadRequest, NewBadRequestResponse(message, err)
}

func DataNotFoundError(message string, err string) (int, any) {
	return http.StatusNotFound, NewDataNotFoundResponse(message, err)
}
