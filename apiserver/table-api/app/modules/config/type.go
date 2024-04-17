package config

const (
	Prefix = "YALC_"
)

type (
	Config struct {
		Auth        Secrets  `envPrefix:"AUTH_"`
		Neon        Neon     `envPrefix:"NEON_"`
		Database    Database `envPrefix:"DATABASE_"`
		HttpAddress string   `env:"HTTP_ADDRESS" envDefault:"0.0.0.0"`
		HttpPort    int      `env:"HTTP_PORT" envDefault:"3000"`
		Env         string   `env:"ENV" envDefault:"development"`
		LogLevel    string   `env:"LOG_LEVEL" envDefault:"debug"`
	}
)

type (
	Secrets struct {
		JwtSecret string `env:"JWT_SECRET"`
	}

	Neon struct {
		BaseURL string `env:"BASE_URL" envDefault:"https://console.neon.tech/api/v2"`
		// should use a secret manager for this
		APIKey    string `env:"API_KEY,file" envDefault:"../neon-api-key.secret"`
		ProjectId string `env:"PROJECT_ID"`
		BranchId  string `env:"BRANCH_ID"`
	}

	Database struct {
		Postgres Postgres `envPrefix:"POSTGRES_"`
	}

	Postgres struct {
		User     string `env:"USER"`
		Password string `env:"PASSWORD"`
		Host     string `env:"HOST"`
		Port     int    `env:"PORT"`
		DBName   string `env:"DBNAME"`
	}
)
