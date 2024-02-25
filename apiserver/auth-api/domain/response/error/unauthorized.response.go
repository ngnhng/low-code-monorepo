package error

import (
	"yalc/auth-service/domain/response"
)

const (
	INVALID_CREDENTIALS_UNAUTHORIZED_MESSAGE = "Invalid Credentials"
	INVALID_CREDENTIALS_UNAUTHORIZED_CODE    = "INVALID_CREDENTIALS_UNAUTHORIZED_ERROR_01"

	AUTHENTICATION_FAILED_UNAUTHORIZED_MESSAGE = "Authentication Failed"
	AUTHENTICATION_FAILED_UNAUTHORIZED_CODE    = "AUTHENTICATION_FAILED_UNAUTHORIZED_ERROR_01"
)

// UnauthorizedResponse is a response error returned by the API when the user is not authorized.
func NewUnauthorizedResponse(message string, err string) response.Response {
	meta := response.NewResponseMeta(401, message, err)
	data := map[string]interface{}{}

	return response.NewResponse(meta, data)
}
