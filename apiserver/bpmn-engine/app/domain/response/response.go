package response

type Response interface {
	Meta() ResponseMeta
	Data() interface{}
}

type ResponseMeta struct {
	StatusCode int    `json:"status_code"`
	Message    string `json:"message"`
	Error      string `json:"error"`
}

type response struct {
	MetaData     ResponseMeta `json:"meta"`
	ResponseData interface{}  `json:"data"`
}

func (r *response) Meta() ResponseMeta {
	return r.MetaData
}

func (r *response) Data() interface{} {
	return r.Data
}

func NewResponseMeta(statusCode int, message string, err string) ResponseMeta {
	return ResponseMeta{
		StatusCode: statusCode,
		Message:    message,
		Error:      err,
	}
}

func NewResponse(meta ResponseMeta, data interface{}) Response {
	return &response{
		MetaData:     meta,
		ResponseData: data,
	}
}
