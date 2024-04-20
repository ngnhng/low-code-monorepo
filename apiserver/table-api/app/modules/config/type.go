package config

const (
	Prefix = "YALC_"
)

type (
	Config struct {
		Auth        Secrets  `envPrefix:"AUTH_"`
		Database    Database `envPrefix:"DATABASE_"`
		Env         string   `env:"ENV" envDefault:"development"`
		HttpAddress string   `env:"HTTP_ADDRESS" envDefault:"0.0.0.0"`
		HttpPort    int      `env:"HTTP_PORT" envDefault:"3000"`
		LogLevel    string   `env:"LOG_LEVEL" envDefault:"debug"`
		Neon        Neon     `envPrefix:"NEON_"`
	}
)

type (
	Secrets struct {
		JwtSecret string `env:"JWT_SECRET" envDefault:"secret"`
	}

	Neon struct {
		BaseURL   string `env:"BASE_URL" envDefault:"https://console.neon.tech/api/v2"`
		Owner     string `env:"OWNER" envDefault:"yalc-data_owner"`
		ProjectId string `env:"PROJECT_ID"`
		BranchId  string `env:"BRANCH_ID"`

		// should use a secret manager for this
		APIKey string `env:"API_KEY"`
	}

	Database struct {
		Postgres Postgres `envPrefix:"POSTGRES_"`
	}

	Postgres struct {
		User     string `env:"USER"`
		Password string `env:"PASSWORD"`
		Host     string `env:"HOST"`
		Port     string `env:"PORT"`
	}
)
