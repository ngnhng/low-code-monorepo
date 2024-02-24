package httpserver

import (
	"context"
	"encoding/json"
	"os"
	"time"

	"yalc/auth-service/module/config"
	"yalc/auth-service/module/httpserver/middleware"
	"yalc/auth-service/module/httpserver/validator"
	"yalc/auth-service/module/logger"

	"github.com/labstack/echo/v4"
	echo_middleware "github.com/labstack/echo/v4/middleware"
	"go.uber.org/fx"
)

type (
	Params struct {
		fx.In
		Configs *config.Config
		Logger  logger.Logger
	}

	server struct {
		echo         *echo.Echo
		ServerConfig *serverConfig `name:"server"`
		Prefix       *echo.Group
		routeBuilder *EchoRouteBuilder
	}

	serverConfig struct {
		ServerAddress string `name:"server_address"`
		Port          string `name:"port"`
		RateLimit     int    `name:"rate_limit"`
		Logger        logger.Logger
	}
)

func (s *server) Start() error {
	s.ServerConfig.Logger.Info("Starting Echo server")

	data, err := json.MarshalIndent(s.echo.Routes(), "", "  ")
	if err != nil {
		return err
	}
	os.WriteFile("routes.json", data, 0o644)

	err = s.echo.Start(":" + s.ServerConfig.Port)

	s.ServerConfig.Logger.Fatal("Error starting Echo server: ", err)

	return err
}

func (s *server) ApplyMiddleware(middleware ...echo.MiddlewareFunc) {
	s.echo.Use(middleware...)
}

func (s *server) GlobalPrefix(prefix string) {
	group := s.echo.Group(prefix)
	s = &server{echo: s.echo, ServerConfig: s.ServerConfig, Prefix: group}
}

func (s *server) Close() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := s.echo.Shutdown(ctx)
	if err != nil {
		s.ServerConfig.Logger.Error("Failed to gracefully shutdown echo server")
	} else {
		s.ServerConfig.Logger.Info("Echo server gracefully stopped")
	}

	return err
}

func (s *server) Group(prefix string) any {
	return s.Prefix.Group(prefix)
}

func (s *server) RouteBuilder() *EchoRouteBuilder {
	if s.routeBuilder == nil {
		s.routeBuilder = &EchoRouteBuilder{}
	}
	if s.routeBuilder.Builder == nil {
		s.routeBuilder.Builder = s.echo.Group("")
	}
	return s.routeBuilder
}

func (e *EchoRouteBuilder) AddGroup(group string, callbackFn func(*echo.Group), middlewares ...echo.MiddlewareFunc) *EchoRouteBuilder {
	callbackFn(e.Builder.Group(group, middlewares...))
	return e
}

func NewEchoServer(p Params) *server {
	e := echo.New()

	e.Validator = validator.NewValidator()

	// Add middleware
	e.Use(
		middleware.InvalidPathResponseFormatMiddleware,
	)

	// CORS
	e.Use(echo_middleware.CORSWithConfig(echo_middleware.CORSConfig{
		AllowOrigins: []string{p.Configs.App.FrontendURL},
		AllowHeaders: []string{
			echo.HeaderOrigin,
			echo.HeaderContentType,
			echo.HeaderAccept,
			echo.HeaderAuthorization,
			echo.HeaderAccessControlAllowCredentials,
			echo.HeaderAccessControlAllowHeaders,
			"next-router-state-tree",
			"next-router-prefetch",
			"next-url",
			"rsc",
		},
		AllowMethods: []string{
			echo.GET,
			echo.HEAD,
			echo.PUT,
			echo.PATCH,
			echo.POST,
			echo.DELETE,
			echo.OPTIONS,
		},
	}))

	rateLimit := 0
	if p.Configs.Env.App.Server.RateLimit.Enabled {
		rateLimit = p.Configs.Env.App.Server.RateLimit.Max
	}

	return &server{
		echo: e,
		ServerConfig: &serverConfig{
			ServerAddress: p.Configs.Env.App.Server.Address,
			Port:          p.Configs.Env.App.Server.Port,
			RateLimit:     rateLimit,
			Logger:        p.Logger,
		},
		routeBuilder: nil,
	}
}
