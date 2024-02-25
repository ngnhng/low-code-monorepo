package error

import (
	"yalc/auth-service/domain/response"
)

const (
	INTERNAL_SERVER_ERROR_MESSAGE = "Internal Server Error"
	INTERNAL_SERVER_ERROR_CODE    = "INTERNAL_SERVER_ERROR_01"
)

// InternalServerErrorResponse is a response error returned by the API when the server has encountered a situation it doesn't know how to handle.
func NewInternalServerErrorResponse(message string, err string) response.Response {
	meta := response.NewResponseMeta(500, message, err)
	data := map[string]interface{}{}

	return response.NewResponse(meta, data)
}
