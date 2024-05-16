package echo

import (
	"encoding/json"
	"os"
	"strconv"
	"yalc/bpmn-engine/modules/config"
	"yalc/bpmn-engine/modules/logger"

	"yalc/bpmn-engine/domain"

	"github.com/golang-jwt/jwt/v5"
	echojwt "github.com/labstack/echo-jwt/v4"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"go.uber.org/fx"
)

type (
	CustomValidator struct{}

	Params struct {
		fx.In

		Config config.Config
		Logger logger.Logger
	}

	EchoHTTPServer struct {
		// Address is the address to listen on
		Address string
		// Port is the port to listen on
		Port int
		// Debug is the debug mode
		Debug bool
		// echo
		Echo *echo.Echo
		// Route builder
		Builder *echo.Group
	}
)

func (cv *CustomValidator) Validate(i any) error {
	// check if i implements Object
	if v, ok := i.(domain.Object); ok {
		return v.Validate()
	}

	return nil
}

// New creates a new EchoHTTPServer
func New(p Params) *EchoHTTPServer {
	e := echo.New()
	e.Validator = &CustomValidator{}
	e.Use(echojwt.WithConfig(echojwt.Config{
		SigningKey: []byte(p.Config.GetConfig().JwtSecret),
		ContextKey: string(domain.UserKey),
	}),
	)

	e.Use(middleware.RequestLoggerWithConfig(middleware.RequestLoggerConfig{
		LogStatus: true,
		LogURI:    true,
		LogError:  true,
		LogValuesFunc: func(c echo.Context, v middleware.RequestLoggerValues) error {
			value, _ := c.Get(string(domain.UserKey)).(*jwt.Token)
			p.Logger.Debug(
				"REQUEST: uri: ",
				v.URI,
				", status: ",
				v.Status,
				", error: ",
				v.Error,
				", user: ",
				value.Claims,
			)
			return nil
		},
	}))

	return &EchoHTTPServer{
		Address: p.Config.GetConfig().HTTPAddress,
		Port:    p.Config.GetConfig().HTTPPort,
		Echo:    e,
		Builder: e.Group("/"),
	}
}

// Start starts the server
func (s *EchoHTTPServer) Start() error {
	data, err := json.MarshalIndent(s.Echo.Routes(), "", "  ")
	if err != nil {
		return err
	}
	os.WriteFile("routes.json", data, 0o644)
	return s.Echo.Start(s.Address + ":" + strconv.Itoa(s.Port))
}

// Close closes the server
func (s *EchoHTTPServer) Close() error {
	return s.Echo.Close()
}

// AddGroup adds a new group to the routing.
//
// fn is a function that will be called with the new group.
//
// We also can register handlers and lower level middlewares in the fn by passing in a function that satisfies the fn signature.
func (s *EchoHTTPServer) AddGroup(prefix string, fn func(g *echo.Group), middlewares ...echo.MiddlewareFunc) *echo.Group {
	g := s.Echo.Group(prefix, middlewares...)
	fn(g)
	return g
}
