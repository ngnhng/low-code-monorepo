package config

const (
	Prefix = "YALC_"
)

type Config interface {
	GetConfig() *Env
}

type (
	config struct {
		env *Env
	}

	Env struct {
		ApiConfig     ApiConfig      `envPrefix:"API_"`
		Environment   string         `env:"ENV" envDefault:"development"`
		HTTPAddress   string         `env:"HTTP_ADDRESS" envDefault:"0.0.0.0"`
		HTTPPort      int            `env:"HTTP_PORT" envDefault:"3000"`
		JwtSecret     string         `env:"AUTH_JWT_SECRET_AT_KEY"`
		LogLevel      string         `env:"LOG_LEVEL" envDefault:"debug"`
		LogPath       string         `env:"LOG_PATH" envDefault:"./log"`
		NatsURL       string         `env:"NATS_URL" envDefault:"nats://localhost:4222"`
		RedisDatabase RedisEnvConfig `envPrefix:"TOKEN_CACHE_"`
	}

	RedisEnvConfig struct {
		Host     string `env:"HOST" envDefault:"localhost"`
		Port     int    `env:"PORT" envDefault:"6379"`
		User     string `env:"USER" envDefault:"redis"`
		Password string `env:"PASSWORD" envDefault:"redis"`
		Db       int    `env:"DB" envDefault:"0"`
	}

	ApiConfig struct {
		AuthApiBaseUrl  string `env:"AUTH_API_BASE_URL"`
		TableApiBaseUrl string `env:"TABLE_API_BASE_URL"`
	}
)

func (c *config) GetConfig() *Env {
	return c.env
}
