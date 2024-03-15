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
		// GetLogPath returns the log file path
		GetLogPath() string
		// GetJwtSecret return the jwt secret
		GetJwtSecret() string
		// GetRedisDatabase returns the redis database configuration
		GetRedisDatabase() RedisEnvConfig
		// GetApiConfig returns the api configuration
		GetApiConfig() ApiConfig
	}
)

// force to implement thes interface
var _ Config = &envConfig{}
