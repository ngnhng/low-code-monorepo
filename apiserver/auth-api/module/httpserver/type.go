package httpserver

import (
	"github.com/labstack/echo/v4"
)

type (
	EchoHTTPServer interface {
		Start() error
		Close() error
		GlobalPrefix(prefix string)
		RouteBuilder() *EchoRouteBuilder
	}

	EchoRouteBuilder struct {
		Builder *echo.Group
	}

	RouteFn struct {
		Method       string
		Path         string
		ControllerFn func(c echo.Context) error
	}
)

// force implement
var _ EchoHTTPServer = &server{}
