package error

import (
	"yalc/auth-service/domain/response"
)

const (
	LOGIN_BAD_REQUEST_MESSAGE = "Malformed Login Request"
	LOGIN_ERROR_CODE          = "LOGIN_ERROR_01"

	REGISTER_BAD_REQUEST_MESSAGE = "Malformed Register Request"
	REGISTER_ERROR_CODE          = "REGISTER_ERROR_01"
)

// BadRequestReponse is a response error returned by the API when the request is invalid.
func NewBadRequestResponse(message string, err string) response.Response {
	meta := response.NewResponseMeta(400, message, err)
	data := map[string]interface{}{}

	return response.NewResponse(meta, data)
}
