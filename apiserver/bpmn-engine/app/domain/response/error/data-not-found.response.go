package error

import (
	"yalc/bpmn-engine/domain/response"
)

const (
	DATA_NOT_FOUND_MESSAGE = "Data Not Found"
	DATA_NOT_FOUND_CODE    = "DATA_NOT_FOUND_ERROR_01"

	PATH_NOT_FOUND_MESSAGE = "Path Not Found"
	PATH_NOT_FOUND_CODE    = "PATH_NOT_FOUND_ERROR_01"
)

// DataNotFoundResponse is a response error returned by the API when the data is not found.
func NewDataNotFoundResponse(message string, err string) response.Response {
	meta := response.NewResponseMeta(404, message, err)
	data := map[string]interface{}{}

	return response.NewResponse(meta, data)
}
