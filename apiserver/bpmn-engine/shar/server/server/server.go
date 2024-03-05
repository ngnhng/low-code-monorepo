package server

import (
	"context"
	"errors"
	"fmt"
	"gitlab.com/shar-workflow/shar/common/telemetry"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/stdout/stdouttrace"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	"go.opentelemetry.io/otel/trace"
	"go.opentelemetry.io/otel/trace/noop"
	"net"
	"os"
	"os/signal"
	"syscall"

	"github.com/hashicorp/go-version"
	"github.com/nats-io/nats.go"
	"gitlab.com/shar-workflow/shar/common/authn"
	"gitlab.com/shar-workflow/shar/common/authz"
	version2 "gitlab.com/shar-workflow/shar/common/version"
	"gitlab.com/shar-workflow/shar/model"
	"gitlab.com/shar-workflow/shar/server/api"
	"gitlab.com/shar-workflow/shar/server/health"
	"gitlab.com/shar-workflow/shar/server/services/storage"
	gogrpc "google.golang.org/grpc"
	grpcHealth "google.golang.org/grpc/health/grpc_health_v1"
	"log/slog"
)

// Server is the shar server type responsible for hosting the SHAR API.
type Server struct {
	sig                     chan os.Signal
	healthServiceEnabled    bool
	healthService           *health.Checker
	grpcServer              *gogrpc.Server
	api                     *api.SharServer
	ephemeralStorage        bool
	panicRecovery           bool
	allowOrphanServiceTasks bool
	concurrency             int
	apiAuthorizer           authz.APIFunc
	apiAuthenticator        authn.Check
	SharVersion             *version.Version
	natsUrl                 string
	grpcPort                int
	conn                    *nats.Conn
	telemetryConfig         telemetry.Config
	tr                      trace.Tracer
}

// New creates a new SHAR server.
// Leave the exporter nil if telemetry is not required
func New(options ...Option) *Server {
	currentVer, err := version.NewVersion(version2.Version)
	if err != nil {
		panic(err)
	}
	s := &Server{
		SharVersion:             currentVer,
		sig:                     make(chan os.Signal, 10),
		healthService:           health.New(),
		panicRecovery:           true,
		allowOrphanServiceTasks: true,
		healthServiceEnabled:    true,
		concurrency:             6,
	}

	for _, i := range options {
		i.configure(s)
	}

	if s.apiAuthorizer == nil {
		slog.Warn("No AuthZ set")
		s.apiAuthorizer = noopAuthZ
	}
	if s.apiAuthenticator == nil {
		slog.Warn("No AuthN set")
		s.apiAuthenticator = noopAuthN
	}

	return s
}

func noopAuthN(_ context.Context, _ *model.ApiAuthenticationRequest) (*model.ApiAuthenticationResponse, error) {
	return &model.ApiAuthenticationResponse{
		User:          "anonymous",
		Authenticated: true,
	}, nil
}

func noopAuthZ(_ context.Context, _ *model.ApiAuthorizationRequest) (*model.ApiAuthorizationResponse, error) {
	return &model.ApiAuthorizationResponse{
		Authorized: true,
	}, nil
}

// Listen starts the GRPC server for both serving requests, and the GRPC health endpoint.
func (s *Server) Listen() {
	// Set up telemetry for the server
	setupTelemetry(s)

	// Capture errors and cancel signals
	errs := make(chan error)

	// Capture SIGTERM and SIGINT
	signal.Notify(s.sig, syscall.SIGTERM, syscall.SIGINT)

	if s.healthServiceEnabled {
		// Create health server and expose on GRPC
		lis, err := net.Listen("tcp", fmt.Sprintf(":%d", s.grpcPort))
		if err != nil {
			slog.Error("listen", err, slog.Int64("grpcPort", int64(s.grpcPort)))
			panic(err)
		}

		s.grpcServer = gogrpc.NewServer()
		if err := registerServer(s.grpcServer, s.healthService); err != nil {
			slog.Error("register grpc health server", err, slog.Int64("grpcPort", int64(s.grpcPort)))
			panic(err)
		}

		// Start health server
		go func() {
			if err := s.grpcServer.Serve(lis); err != nil {
				errs <- err
			}
			close(errs)
		}()
		slog.Info("shar grpc health started")
	} else {
		// Create private health server
		s.healthService.SetStatus(grpcHealth.HealthCheckResponse_NOT_SERVING)
	}

	ns := s.createServices(s.conn, s.natsUrl, s.ephemeralStorage, s.allowOrphanServiceTasks)
	a, err := api.New(ns, s.panicRecovery, s.apiAuthorizer, s.apiAuthenticator, s.telemetryConfig)
	if err != nil {
		panic(err)
	}
	s.api = a
	s.healthService.SetStatus(grpcHealth.HealthCheckResponse_SERVING)

	if err := s.api.Listen(); err != nil {
		panic(err)
	}
	// Log or exit
	select {
	case err := <-errs:
		if err != nil {
			slog.Error("fatal error", err)
			panic("fatal error")
		}
	case <-s.sig:
		s.Shutdown()
	}
}

func setupTelemetry(s *Server) {
	var traceName = "shar"
	switch s.telemetryConfig.Endpoint {
	case "console":
		exporter, err := stdouttrace.New(stdouttrace.WithPrettyPrint())
		if err != nil {
			err := fmt.Errorf("create stdouttrace exporter: %w", err)
			slog.Error(err.Error())
			otel.SetTracerProvider(noop.NewTracerProvider())
			goto setProvider
		}
		batchSpanProcessor := sdktrace.NewBatchSpanProcessor(exporter)
		tp := sdktrace.NewTracerProvider(
			sdktrace.WithSampler(sdktrace.AlwaysSample()),
			sdktrace.WithSpanProcessor(batchSpanProcessor),
		)
		otel.SetTracerProvider(tp)
	default:
		otel.SetTracerProvider(noop.NewTracerProvider())
	}
setProvider:
	s.tr = otel.GetTracerProvider().Tracer(traceName, trace.WithInstrumentationVersion(version2.Version))
}

// Shutdown gracefully shuts down the GRPC server, and requests that
func (s *Server) Shutdown() {

	s.healthService.SetStatus(grpcHealth.HealthCheckResponse_NOT_SERVING)

	s.api.Shutdown()
	if s.healthServiceEnabled {
		s.grpcServer.GracefulStop()
		slog.Info("shar grpc health stopped")
	}
}

// GetEndPoint will return the URL of the GRPC health endpoint for the shar server
func (s *Server) GetEndPoint() string {
	return "TODO" //can we discover the grpc endpoint listen address??
}

func (s *Server) createServices(conn *nats.Conn, natsURL string, ephemeral bool, allowOrphanServiceTasks bool) *storage.Nats {
	//TODO why do we need a separate txConn?
	txConn, err := nats.Connect(natsURL)
	if err != nil {
		slog.Error("connect to NATS", slog.String("error", err.Error()), slog.String("url", natsURL))
		panic(err)
	}

	if js, err := conn.JetStream(); err != nil {
		panic(errors.New("cannot form JetSteram connection"))
	} else {
		if _, err := js.AccountInfo(); err != nil {
			panic(errors.New("contact JetStream. ensure it is enabled on the specified NATS instance"))
		}
	}

	var store = nats.FileStorage
	if ephemeral {
		store = nats.MemoryStorage
	}
	ns, err := storage.New(conn, txConn, store, s.concurrency, allowOrphanServiceTasks, s.telemetryConfig)
	if err != nil {
		slog.Error("create NATS KV store", slog.String("error", err.Error()))
		panic(err)
	}
	return ns
}

// Ready returns true if the SHAR server is servicing API calls.
func (s *Server) Ready() bool {
	if s.healthService != nil {
		return s.healthService.GetStatus() == grpcHealth.HealthCheckResponse_SERVING
	} else {
		return false
	}
}

func (s *Server) setSharVersion(version *version.Version) {
	s.SharVersion = version
}

func registerServer(s *gogrpc.Server, hs *health.Checker) error {
	hs.SetStatus(grpcHealth.HealthCheckResponse_NOT_SERVING)
	grpcHealth.RegisterHealthServer(s, hs)
	return nil
}
