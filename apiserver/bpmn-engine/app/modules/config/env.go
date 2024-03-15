package config

import (
	"log"
	"os"
	"path/filepath"
	"strconv"

	"github.com/joho/godotenv"
)

type (
	// Config is the configuration for the application
	envConfig struct {
		Env           string `required:"true" envconfig:"ENV" default:"development"`
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

func New() (Config, error) {
	cwd, err := os.Getwd()
	if err != nil {
		return nil, err
	}
	envMap, err := godotenv.Read(filepath.Join(cwd, ".env.local"))
	if err != nil {
		return nil, err
	}
	c := envConfig{}
	err = c.Load(envMap)
	if err != nil {
		return nil, err
	}
	log.Println(c)
	return &c, nil
}

// GetEnv returns the environment
func (c *envConfig) GetEnv() string {
	return c.Env
}

func (c *envConfig) GetLogLevel() string {
	return c.LogLevel
}

// GetNatsURL returns the nats url
func (c *envConfig) GetNatsURL() string {
	return c.NatsURL
}

func (c *envConfig) GetAddress() string {
	return ""
}

func (c *envConfig) GetPort() int {
	return 3000
}

func (c *envConfig) GetLogPath() string {
	return "./log"
}

func (c *envConfig) GetJwtSecret() string {
	return c.JwtSecret
}

func (c *envConfig) GetRedisDatabase() RedisEnvConfig {
	return c.RedisDatabase
}

func (c *envConfig) GetApiConfig() ApiConfig {
	return c.ApiConfig
}

func (c *envConfig) Load(envMap map[string]string) error {
	c.Env = getEnvOrDefault(envMap, "ENV", "development")
	c.LogLevel = getEnvOrDefault(envMap, "LOG_LEVEL", "debug")
	c.NatsURL = getEnvOrDefault(envMap, "NATS_URL", "nats://localhost:4222")
	c.LogPath = getEnvOrDefault(envMap, "LOG_PATH", "./log")
	c.JwtSecret = getEnvOrDefault(envMap, "JWT_SECRET", "secret-not-set")
	c.RedisDatabase.Host = getEnvOrDefault(envMap, "REDIS_HOST", "localhost")

	portStr := getEnvOrDefault(envMap, "REDIS_PORT", "6379")
	port, err := strconv.Atoi(portStr)
	if err != nil {
		return err
	}
	c.RedisDatabase.Port = port

	c.RedisDatabase.User = getEnvOrDefault(envMap, "REDIS_USER", "")
	c.RedisDatabase.Password = getEnvOrDefault(envMap, "REDIS_PASSWORD", "")
	dbStr := getEnvOrDefault(envMap, "REDIS_DB", "0")
	db, err := strconv.Atoi(dbStr)
	if err != nil {
		return err
	}

	c.RedisDatabase.Db = db

	c.ApiConfig.AuthApiBaseUrl = getEnvOrDefault(envMap, "AUTH_API_BASE_URL", "http://localhost:3001")

	return nil
}

func getEnvOrDefault(envMap map[string]string, key, defaultValue string) string {
	if value, ok := envMap[key]; ok {
		return value
	}
	return defaultValue
}
