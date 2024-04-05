package server

import (
	version2 "github.com/hashicorp/go-version"
	"github.com/nats-io/nats.go"
	"gitlab.com/shar-workflow/shar/common/authn"
	"gitlab.com/shar-workflow/shar/common/authz"
	"gitlab.com/shar-workflow/shar/common/telemetry"
)

// Option represents a SHAR server option
type Option interface {
	configure(server *Server)
}

// EphemeralStorage instructs SHAR to use memory rather than disk for storage.
// This is not recommended for production use.
func EphemeralStorage() ephemeralStorageOption { //nolint
	return ephemeralStorageOption{}
}

type ephemeralStorageOption struct {
}

func (o ephemeralStorageOption) configure(server *Server) {
	server.ephemeralStorage = true
}

// PanicRecovery enables or disables SHAR's ability to recover from server panics.
// This is on by default, and disabling it is not recommended for production use.
func PanicRecovery(enabled bool) panicOption { //nolint
	return panicOption{value: enabled}
}

type panicOption struct{ value bool }

func (o panicOption) configure(server *Server) {
	server.panicRecovery = o.value
}

// PreventOrphanServiceTasks enables or disables SHAR's validation of service task names againt existing workflows.
func PreventOrphanServiceTasks() orphanTaskOption { //nolint
	return orphanTaskOption{value: true}
}

type orphanTaskOption struct{ value bool }

func (o orphanTaskOption) configure(server *Server) {
	server.allowOrphanServiceTasks = o.value
}

// Concurrency specifies the number of threads for each of SHAR's queue listeneres.
func Concurrency(n int) concurrencyOption { //nolint
	return concurrencyOption{value: n}
}

type concurrencyOption struct{ value int }

func (o concurrencyOption) configure(server *Server) {
	server.concurrency = o.value
}

// WithApiAuthorizer specifies a handler function for API authorization.
func WithApiAuthorizer(authFn authz.APIFunc) apiAuthorizerOption { //nolint
	return apiAuthorizerOption{value: authFn}
}

type apiAuthorizerOption struct{ value authz.APIFunc }

func (o apiAuthorizerOption) configure(server *Server) {
	server.apiAuthorizer = o.value
}

// WithAuthentication specifies a handler function for API authorization.
func WithAuthentication(authFn authn.Check) authenticationOption { //nolint
	return authenticationOption{value: authFn}
}

type authenticationOption struct{ value authn.Check }

func (o authenticationOption) configure(server *Server) {
	server.apiAuthenticator = o.value
}

// WithNoHealthServer specifies a handler function for API authorization.
func WithNoHealthServer() noHealthServerOption { //nolint
	return noHealthServerOption{}
}

type noHealthServerOption struct{}

func (o noHealthServerOption) configure(server *Server) {
	server.healthServiceEnabled = false
}

// WithSharVersion instructs SHAR to claim it is a specific version.
// This is highly inadvisable as datalos may occur.
func WithSharVersion(version *version2.Version) sharVersionOption { //nolint
	return sharVersionOption{version: version}
}

type sharVersionOption struct {
	version *version2.Version
}

func (o sharVersionOption) configure(server *Server) {
	server.setSharVersion(o.version)
}

// NatsUrl specifies the nats URL to connect to
func NatsUrl(url string) natsUrlOption { //nolint
	return natsUrlOption{value: url}
}

type natsUrlOption struct{ value string }

func (o natsUrlOption) configure(server *Server) {
	server.natsUrl = o.value
}

// NatsConn specifies the nats Conn to use
func NatsConn(conn *nats.Conn) natsConnOption { //nolint
	return natsConnOption{value: conn}
}

type natsConnOption struct{ value *nats.Conn }

func (o natsConnOption) configure(server *Server) {
	server.conn = o.value
}

// GrpcPort specifies the port healthcheck is listening on
func GrpcPort(port int) grpcPortOption { //nolint
	return grpcPortOption{value: port}
}

type grpcPortOption struct{ value int }

func (o grpcPortOption) configure(server *Server) {
	server.grpcPort = o.value
}

// WithTelemetryEndpoint specifies a handler function for API authorization.
func WithTelemetryEndpoint(endpoint string) telemetryEndpointOption { //nolint
	return telemetryEndpointOption{endpoint: endpoint}
}

type telemetryEndpointOption struct {
	endpoint string
}

func (o telemetryEndpointOption) configure(server *Server) {
	server.telemetryConfig = telemetry.Config{Enabled: o.endpoint != "", Endpoint: o.endpoint}
}
