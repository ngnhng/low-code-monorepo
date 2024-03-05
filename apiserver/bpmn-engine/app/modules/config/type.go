package config

type (
	Config interface {
		// GetEnv returns the environment
		GetEnv() string
		// GetNatsURL returns the nats url
		GetNatsURL() string
		// GetLogLevel returns the log level
		GetLogLevel() string
		// Get Address
		GetAddress() string
		// Get Port
		GetPort() int
	}
)

// force to implement thes interface
var _ Config = &envConfig{}
