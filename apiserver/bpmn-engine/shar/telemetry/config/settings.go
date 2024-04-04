package config

import (
	"fmt"
	"github.com/caarlos0/env/v6"
)

// Settings is the settings provider for telemetry.
type Settings struct {
	NatsURL              string `env:"NATS_URL" envDefault:"nats://127.0.0.1:4222"`
	LogLevel             string `env:"SHAR_LOG_LEVEL" envDefault:"warn"`
	OTLPEndpoint         string `env:"OTLP_URL" envDefault:"localhost:4318"`
	OTLPEndpointIsSecure bool   `env:"OTLP_IS_SECURE" envDefault:"false"`
}

// GetEnvironment pulls the active settings into a settings struct.
func GetEnvironment() (*Settings, error) {
	cfg := Settings{}
	if err := env.Parse(&cfg); err != nil {
		return nil, fmt.Errorf("parse environment settings: %w", err)
	}
	return &cfg, nil
}
