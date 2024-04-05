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

	Env struct {
		Environment   string `required:"true" envconfig:"ENVIRONMENT" default:"development"`
		LogLevel      string `required:"true" envconfig:"LOG_LEVEL" default:"debug"`
		NatsURL       string `required:"true" envconfig:"NATS_URL" default:"nats://localhost:4222"`
		LogPath       string `required:"true" envconfig:"LOG_PATH" default:"./log"`
		JwtSecret     string `required:"true" envconfig:"JWT_SECRET"`
		RedisDatabase RedisEnvConfig
		ApiConfig     ApiConfig
	}

	RedisEnvConfig struct {
		Host     string
		Port     int
		User     string
		Password string
		Db       int
	}

	ApiConfig struct {
		AuthApiBaseUrl string `required:"true" envconfig:"AUTH_API_BASE_URL"`
	}
)

// force to implement thes interface
var _ Config = &LocalConfig{}
