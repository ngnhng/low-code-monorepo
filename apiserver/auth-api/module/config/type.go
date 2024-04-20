package config

import (
	"time"
)

const (
	Prefix = "YALC_"
)

type (
	Config struct {
		*Env
	}
)

type (
	Env struct {
		App         App        `envPrefix:"APP_"`
		Api         Api        `envPrefix:"API_"`
		Env         string     `env:"ENV" envDefault:"development"`
		HTTPAddress string     `env:"HTTP_ADDRESS" envDefault:"0.0.0.0"`
		HTTPPort    string     `env:"HTTP_PORT" envDefault:"3000"`
		Jwt         JwtSecret  `envPrefix:"AUTH_JWT_"`
		OAuth       OAuth      `envPrefix:"OAUTH_"`
		Repository  Repository `envPrefix:"DATABASE_"`
		LogLevel    string     `env:"LOG_LEVEL" envDefault:"debug"`
	}

	App struct {
		FrontendURL string    `env:"FRONTEND_BASE_URL"`
		RateLimit   RateLimit `envPrefix:"RATE_LIMIT_"`
	}

	Api struct {
		UserApiUrl string `env:"USER_API_BASE_URL"`
	}

	Server struct {
		Address   string    `env:"ADDRESS"`
		Port      string    `env:"PORT"`
		RateLimit RateLimit `env:"RATE_LIMIT"`
	}

	RateLimit struct {
		Enabled  bool          `env:"ENABLED" envDefault:"false"`
		Max      int           `env:"MAX" envDefault:"0"`
		Duration time.Duration `env:"DURATION" envDefault:"0s"`
	}

	Login struct {
		Timeout time.Duration `env:"TIMEOUT"`
	}

	UserStore struct {
		Host     string `env:"HOST"`
		Port     int    `env:"PORT"`
		User     string `env:"USER"`
		Password string `env:"PASSWORD"`
		Name     string `env:"USER_DB"`
	}

	RedisTokenStore struct {
		Host     string `env:"HOST"`
		Port     string `env:"PORT"`
		Password string `env:"PASSWORD"`
		Db       string `env:"DB"`
		Address  string `env:"ADDRESS,expand"`
	}

	Repository struct {
		User  UserStore       `envPrefix:"POSTGRES_"`
		Token RedisTokenStore `envPrefix:"TOKEN_CACHE_"`
	}

	JwtSecret struct {
		Access  JwtAccessTokenSecret  `envPrefix:"SECRET_AT_"`
		Refresh JwtRefreshTokenSecret `envPrefix:"SECRET_RT_"`
	}

	JwtAccessTokenSecret struct {
		Key        string        `env:"KEY"`
		Expiration time.Duration `env:"EXPIRATION"`
	}

	JwtRefreshTokenSecret struct {
		Key        string        `env:"KEY"`
		Expiration time.Duration `env:"EXPIRATION"`
	}

	OAuth struct {
		Google OAuth2Provider `envPrefix:"GOOGLE_"`
	}

	OAuth2Provider struct {
		ClientID     string `env:"CLIENT_ID"`
		ClientSecret string `env:"CLIENT_SECRET"`
		RedirectURL  string `env:"REDIRECT_URL"`
	}
)
