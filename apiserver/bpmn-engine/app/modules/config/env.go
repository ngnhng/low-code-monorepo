package config

import (
	"log"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
)

type (
	// Config is the configuration for the application
	envConfig struct {
		Env      string `required:"true" envconfig:"ENV" default:"development"`
		LogLevel string `required:"true" envconfig:"LOG_LEVEL" default:"debug"`
		NatsURL  string `required:"true" envconfig:"NATS_URL" default:"nats://localhost:4222"`
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

func (c *envConfig) Load(envMap map[string]string) (err error) {
	var ok bool
	c.Env, ok = envMap["ENV"]
	if !ok {
		c.Env = "development"
	}
	c.LogLevel, ok = envMap["LOG_LEVEL"]
	if !ok {
		c.LogLevel = "debug"
	}
	c.NatsURL, ok = envMap["NATS_URL"]
	if !ok {
		c.NatsURL = "nats://localhost:4222"
	}
	return nil
}
