package config

import (
	"os"
	"strconv"
)

type (
	// DevelopmentConfig is the configuration for the development environment
	// which is the docker compose environment
	DevelopmentConfig struct {
		*Env
	}
)

// NewDevConfig creates a new DevelopmentConfig
func NewDevConfig() (Config, error) {
	c := DevelopmentConfig{
		Env: &Env{},
	}
	err := c.load()
	if err != nil {
		return nil, err
	}
	return &c, nil
}

// GetEnv returns the environment
func (c *DevelopmentConfig) GetEnv() string {
	return c.Env.Environment
}

func (c *DevelopmentConfig) GetLogLevel() string {
	return c.Env.LogLevel
}

// GetNatsURL returns the nats url
func (c *DevelopmentConfig) GetNatsURL() string {
	return c.Env.NatsURL
}

func (c *DevelopmentConfig) GetAddress() string {
	return ""
}

func (c *DevelopmentConfig) GetPort() int {
	return 3000
}

func (c *DevelopmentConfig) GetLogPath() string {
	return "./log"
}

func (c *DevelopmentConfig) GetJwtSecret() string {
	return c.Env.JwtSecret
}

func (c *DevelopmentConfig) GetRedisDatabase() RedisEnvConfig {
	return c.Env.RedisDatabase
}

func (c *DevelopmentConfig) GetApiConfig() ApiConfig {
	return c.Env.ApiConfig
}

func (c *DevelopmentConfig) load() error {

	c.Env.Environment = c.getEnvOrDefault("ENVIRONMENT", "development")
	c.Env.LogLevel = c.getEnvOrDefault("LOG_LEVEL", "debug")
	c.Env.NatsURL = c.getEnvOrDefault("NATS_URL", "nats://localhost:4222")
	c.Env.LogPath = c.getEnvOrDefault("LOG_PATH", "./log")
	c.Env.JwtSecret = c.getEnvOrDefault("JWT_SECRET", "secret-not-set")
	c.Env.RedisDatabase.Host = c.getEnvOrDefault("REDIS_HOST", "localhost")

	portStr := c.getEnvOrDefault("REDIS_PORT", "6379")
	port, err := strconv.Atoi(portStr)
	if err != nil {
		return err
	}
	c.Env.RedisDatabase.Port = port

	c.Env.RedisDatabase.User = c.getEnvOrDefault("REDIS_USER", "")
	c.Env.RedisDatabase.Password = c.getEnvOrDefault("REDIS_PASSWORD", "")
	dbStr := c.getEnvOrDefault("REDIS_DB", "0")
	db, err := strconv.Atoi(dbStr)
	if err != nil {
		return err
	}

	c.Env.RedisDatabase.Db = db

	c.Env.ApiConfig.AuthApiBaseUrl = c.getEnvOrDefault("AUTH_API_BASE_URL", "http://localhost:3001")

	return nil
}

func (c *DevelopmentConfig) getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
