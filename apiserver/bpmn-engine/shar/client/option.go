package client

import "github.com/nats-io/nats.go"

// WithEphemeralStorage specifies a client store the result of all operations in memory.
func WithEphemeralStorage() ConfigurationOption { //nolint
	return ephemeralStorage{}
}

type ephemeralStorage struct{}

func (o ephemeralStorage) configure(client *Client) {
	client.storageType = nats.MemoryStorage
}

// WithConcurrency specifies the number of threads to process each service task.
func WithConcurrency(n int) ConfigurationOption { //nolint
	return concurrency{val: n}
}

type concurrency struct {
	val int
}

// ConfigurationOption represents an interface for configuring a client.
type ConfigurationOption interface {
	configure(client *Client)
}

func (o concurrency) configure(client *Client) {
	client.concurrency = o.val
}

// WithNoRecovery disables panic recovery for debugging.
func WithNoRecovery() ConfigurationOption { //nolint
	return noRecovery{}
}

type noRecovery struct {
}

func (o noRecovery) configure(client *Client) {
	client.noRecovery = true
}

// WithOpenTelemetry enables the flow of Open Telemetry Trace and Span IDs.
func WithOpenTelemetry() OpenTelemetry {
	return OpenTelemetry{}
}

// OpenTelemetry represents a type for enabling OpenTelemetry for a client.
type OpenTelemetry struct {
}

func (o OpenTelemetry) configure(client *Client) {
	client.telemetryConfig.Enabled = true
}

// WithNoOSSig disables SIGINT and SIGKILL processing within the client.
func WithNoOSSig() ConfigurationOption { //nolint
	return noOSSig{}
}

type noOSSig struct {
}

func (o noOSSig) configure(client *Client) {
	client.noOSSig = true
}

// WithNamespace applies a client namespace.
func WithNamespace(name string) ConfigurationOption { //nolint
	return namespace{name: name}
}

type namespace struct {
	name string
}

func (o namespace) configure(client *Client) {
	client.ns = o.name
}
