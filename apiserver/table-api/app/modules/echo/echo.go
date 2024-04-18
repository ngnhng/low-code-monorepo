package echo

import (
	"context"
	"encoding/json"
	"os"
	"strconv"
	"yalc/dbms/domain"
	"yalc/dbms/modules/config"
	"yalc/dbms/modules/logger"
	"yalc/dbms/shared"

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

		Config *config.Config
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

	EchoContext struct {
		echo.Context
	}
)

var _ shared.RequestContext = (*EchoContext)(nil)

func (cv *CustomValidator) Validate(i any) error {
	// check if i implements Object
	if v, ok := i.(domain.Object); ok {
		return v.Validate()
	}

	return nil
}

// New creates a new EchoHTTPServer
func NewEchoServer(p Params) *EchoHTTPServer {
	e := echo.New()
	e.Validator = &CustomValidator{}

	// Add custom context wrapper
	e.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			cc := &EchoContext{c}
			return next(cc)
		}
	})

	// Add JWT middleware
	e.Use(echojwt.WithConfig(echojwt.Config{
		SigningKey: []byte(p.Config.Auth.JwtSecret),
		ContextKey: string(shared.UserKey),
	}),
	)

	// Add request logger middleware
	e.Use(middleware.RequestLoggerWithConfig(middleware.RequestLoggerConfig{
		LogStatus: true,
		LogURI:    true,
		LogError:  true,
		LogValuesFunc: func(c echo.Context, v middleware.RequestLoggerValues) error {
			value, _ := c.Get(string(shared.UserKey)).(*jwt.Token)

			p.Logger.Info(
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
		Address: p.Config.HttpAddress,
		Port:    p.Config.HttpPort,
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

// GetUserID returns the user id from the context
func (ctx *EchoContext) GetUserId() string {
	claims, ok := ctx.Get(string(shared.UserKey)).(*jwt.Token)
	if !ok {
		return ""
	}
	return claims.Claims.(jwt.MapClaims)["email"].(string)
}

// Context returns the echo context
func (ctx *EchoContext) GetContext() context.Context {
	return ctx.Request().Context()
}
