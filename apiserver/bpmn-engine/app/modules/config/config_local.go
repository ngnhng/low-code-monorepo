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
	LocalConfig struct {
		Env *Env
	}
)

func NewLocalConfig() (Config, error) {
	cwd, err := os.Getwd()
	if err != nil {
		return nil, err
	}
	envFile := filepath.Join(cwd, ".env.local")
	envMap, err := godotenv.Read(envFile)
	if err != nil {
		return nil, err
	}
	c := LocalConfig{
		Env: &Env{},
	}
	err = c.load(envMap)
	if err != nil {
		return nil, err
	}
	log.Println(c)
	return &c, nil
}

// GetEnv returns the environment
func (c *LocalConfig) GetEnv() string {
	return c.Env.Environment
}

func (c *LocalConfig) GetLogLevel() string {
	return c.Env.LogLevel
}

// GetNatsURL returns the nats url
func (c *LocalConfig) GetNatsURL() string {
	return c.Env.NatsURL
}

func (c *LocalConfig) GetAddress() string {
	return ""
}

func (c *LocalConfig) GetPort() int {
	return 3000
}

func (c *LocalConfig) GetLogPath() string {
	return "./log"
}

func (c *LocalConfig) GetJwtSecret() string {
	return c.Env.JwtSecret
}

func (c *LocalConfig) GetRedisDatabase() RedisEnvConfig {
	return c.Env.RedisDatabase
}

func (c *LocalConfig) GetApiConfig() ApiConfig {
	return c.Env.ApiConfig
}

func (c *LocalConfig) load(envMap map[string]string) error {
	c.Env.Environment = c.getEnvOrDefault(envMap, "ENVIRONMENT", "local")
	c.Env.LogLevel = c.getEnvOrDefault(envMap, "LOG_LEVEL", "debug")
	c.Env.NatsURL = c.getEnvOrDefault(envMap, "NATS_URL", "nats://localhost:4222")
	c.Env.LogPath = c.getEnvOrDefault(envMap, "LOG_PATH", "./log")
	c.Env.JwtSecret = c.getEnvOrDefault(envMap, "JWT_SECRET", "secret-not-set")
	c.Env.RedisDatabase.Host = c.getEnvOrDefault(envMap, "REDIS_HOST", "localhost")

	portStr := c.getEnvOrDefault(envMap, "REDIS_PORT", "6379")
	port, err := strconv.Atoi(portStr)
	if err != nil {
		return err
	}
	c.Env.RedisDatabase.Port = port

	c.Env.RedisDatabase.User = c.getEnvOrDefault(envMap, "REDIS_USER", "")
	c.Env.RedisDatabase.Password = c.getEnvOrDefault(envMap, "REDIS_PASSWORD", "")
	dbStr := c.getEnvOrDefault(envMap, "REDIS_DB", "0")
	db, err := strconv.Atoi(dbStr)
	if err != nil {
		return err
	}

	c.Env.RedisDatabase.Db = db

	c.Env.ApiConfig.AuthApiBaseUrl = c.getEnvOrDefault(envMap, "AUTH_API_BASE_URL", "http://localhost:3001")

	return nil
}

func (c *LocalConfig) getEnvOrDefault(envMap map[string]string, key, defaultValue string) string {
	if value, ok := envMap[key]; ok {
		return value
	}
	return defaultValue
}
