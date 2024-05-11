package logger

//type Logger interface {
//	Debug(msg string)
//	Info(msg string)
//	Fatal(msg string)
//	Error(msg string)
//	LogRequest(...interface{})
//}

type Fields map[string]interface{}

type Logger interface {
	Configure(cfg func(internalLog interface{}))
	Debug(args ...interface{})
	Debugf(template string, args ...interface{})
	Debugw(msg string, fields Fields)
	Info(args ...interface{})
	Infof(template string, args ...interface{})
	Infow(msg string, fields Fields)
	Warn(args ...interface{})
	Warnf(template string, args ...interface{})
	WarnMsg(msg string, err error)
	Error(args ...interface{})
	Errorw(msg string, fields Fields)
	Errorf(template string, args ...interface{})
	Err(msg string, err error)
	Fatal(args ...interface{})
	Fatalf(template string, args ...interface{})
	Printf(template string, args ...interface{})
	WithName(name string)
	//GrpcMiddlewareAccessLogger(
	//	method string,
	//	time time.Duration,
	//	metaData map[string][]string,
	//	err error,
	//)
	//GrpcClientInterceptorLogger(
	//	method string,
	//	req interface{},
	//	reply interface{},
	//	time time.Duration,
	//	metaData map[string][]string,
	//	err error,
	//)
}

var _ Logger = (*zapLogger)(nil)
