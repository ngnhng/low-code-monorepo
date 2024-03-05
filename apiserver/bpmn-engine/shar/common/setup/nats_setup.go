package setup

import (
	"context"
	_ "embed"
	"errors"
	"fmt"
	"github.com/goccy/go-yaml"
	"github.com/hashicorp/go-version"
	"github.com/nats-io/nats.go"
	"gitlab.com/shar-workflow/shar/common"
	"gitlab.com/shar-workflow/shar/common/namespace"
	"gitlab.com/shar-workflow/shar/common/setup/upgrader"
	sharVersion "gitlab.com/shar-workflow/shar/common/version"
	"regexp"
)

// NatsConfig is the SHAR NATS configuration format
type NatsConfig struct {
	Streams  []NatsStream   `json:"streams"`
	KeyValue []NatsKeyValue `json:"buckets"`
}

// NatsKeyValue holds information about a NATS Key-Value store (bucket)
type NatsKeyValue struct {
	Config nats.KeyValueConfig `json:"nats-config"`
}

// NatsConsumer holds information about a NATS Consumer
type NatsConsumer struct {
	Config nats.ConsumerConfig `json:"nats-config"`
}

// NatsStream holds information about a NATS Stream
type NatsStream struct {
	Config    nats.StreamConfig `json:"nats-config"`
	Consumers []NatsConsumer    `json:"nats-consumers"`
}

// Nats sets up nats server objects.
func Nats(ctx context.Context, nc common.NatsConn, js nats.JetStreamContext, storageType nats.StorageType, config string, update bool, ns string) error {
	cfg := &NatsConfig{}
	if err := yaml.Unmarshal([]byte(config), cfg); err != nil {
		return fmt.Errorf("parse nats-config.yaml: %w", err)
	}

	for _, stream := range cfg.Streams {
		stream.Config.Storage = storageType
		if err := EnsureStream(ctx, nc, js, stream.Config, storageType); err != nil {
			return fmt.Errorf("ensure stream: %w", err)
		}
		for _, consumer := range stream.Consumers {
			consumer.Config.MemoryStorage = storageType == nats.MemoryStorage
			if err := EnsureConsumer(js, stream.Config.Name, consumer.Config, update, storageType); err != nil {
				return fmt.Errorf("ensure consumer: %w", err)
			}
		}
	}

	err := EnsureBuckets(cfg, js, storageType, ns)
	if err != nil {
		return err
	}

	return nil
}

// EnsureConsumer creates a new consumer appending the current semantic version number to the description.  If the consumer exists and has a previous version, it upgrader it.
func EnsureConsumer(js nats.JetStreamContext, streamName string, consumerConfig nats.ConsumerConfig, update bool, storageType nats.StorageType) error {
	consumerConfig.MemoryStorage = storageType == nats.MemoryStorage
	if ci, err := js.ConsumerInfo(streamName, consumerConfig.Durable); errors.Is(err, nats.ErrConsumerNotFound) {
		if consumerConfig.Metadata == nil {
			consumerConfig.Metadata = make(map[string]string)
		}
		consumerConfig.Metadata["shar_version"] = sharVersion.Version
		if _, err := js.AddConsumer(streamName, &consumerConfig); err != nil {
			return fmt.Errorf("cannot ensure consumer '%s' with subject '%s' : %w", consumerConfig.Name, consumerConfig.FilterSubject, err)
		}
	} else if err != nil {
		return fmt.Errorf("ensure consumer: %w", err)
	} else {
		if !update {
			return nil
		}
		if ok := requiresUpgrade(ci.Config.Metadata["shar_version"], sharVersion.Version); ok {
			if consumerConfig.Metadata == nil {
				consumerConfig.Metadata = make(map[string]string)
			}
			consumerConfig.Metadata["shar_version"] = sharVersion.Version
			_, err := js.UpdateConsumer(streamName, &consumerConfig)
			if err != nil {
				return fmt.Errorf("ensure stream couldn't update the consumer configuration for %s: %w", consumerConfig.Name, err)
			}
		}
	}
	return nil
}

// EnsureStream creates a new stream appending the current semantic version number to the description.  If the stream exists and has a previous version, it upgrader it.
func EnsureStream(ctx context.Context, nc common.NatsConn, js nats.JetStreamContext, streamConfig nats.StreamConfig, storageType nats.StorageType) error {
	streamConfig.Storage = storageType
	if si, err := js.StreamInfo(streamConfig.Name); errors.Is(err, nats.ErrStreamNotFound) {
		if streamConfig.Metadata == nil {
			streamConfig.Metadata = make(map[string]string)
		}
		streamConfig.Metadata["shar_version"] = sharVersion.Version
		if _, err := js.AddStream(&streamConfig); err != nil {
			return fmt.Errorf("add stream: %w", err)
		}
	} else if err != nil {
		return fmt.Errorf("ensure stream: %w", err)
	} else {
		if ok := requiresUpgrade(si.Config.Metadata["shar_version"], sharVersion.Version); ok {
			existingVer := upgradeExpr.FindString(si.Config.Description)
			if existingVer == "" {
				existingVer = sharVersion.Version
			}
			if err := upgrader.Patch(ctx, existingVer, nc, js); err != nil {
				return fmt.Errorf("ensure stream: %w", err)
			}
			if streamConfig.Metadata == nil {
				streamConfig.Metadata = make(map[string]string)
			}
			streamConfig.Metadata["shar_version"] = sharVersion.Version
			_, err := js.UpdateStream(&streamConfig)
			if err != nil {
				return fmt.Errorf("ensure stream updating stream configuration: %w", err)
			}
		}
	}
	return nil
}

// EnsureBuckets creates a list of buckets if they do not exist
func EnsureBuckets(cfg *NatsConfig, js nats.JetStreamContext, storageType nats.StorageType, ns string) error {
	namespaceBucketNameFn := func(kvCfg *nats.KeyValueConfig) {
		kvCfg.Bucket = namespace.PrefixWith(ns, kvCfg.Bucket)
	}

	for i := range cfg.KeyValue {
		if err := EnsureBucket(js, &cfg.KeyValue[i].Config, storageType, namespaceBucketNameFn); err != nil {
			return fmt.Errorf("ensure key-value: %w", err)
		}
	}
	return nil
}

// EnsureBucket creates a bucket if it does not exist
func EnsureBucket(js nats.JetStreamContext, cfg *nats.KeyValueConfig, storageType nats.StorageType, namespaceBucketNameFn func(*nats.KeyValueConfig)) error {
	namespaceBucketNameFn(cfg)
	cfg.Storage = storageType

	if _, err := js.KeyValue(cfg.Bucket); errors.Is(err, nats.ErrBucketNotFound) {
		if _, err := js.CreateKeyValue(cfg); err != nil {
			return fmt.Errorf("ensure buckets: %w", err)
		}
	} else if err != nil {
		return fmt.Errorf("obtain bucket: %w", err)
	}
	return nil
}

// upgradeExpr is the version check regex
var upgradeExpr = regexp.MustCompilePOSIX(`([0-9])*\.([0-9])*\.([0-9])*$`)

// requiresUpgrade reads the description on an existing SHAR JetStream object.  It compares this with the running version and returs true if an upgrade is needed.
func requiresUpgrade(description string, newVersion string) bool {

	if v := upgradeExpr.FindString(description); len(v) == 0 {
		return true
	} else {
		v1, err := version.NewVersion(v)
		if err != nil {
			return true
		}
		v2, err := version.NewVersion(newVersion)
		if err != nil {
			return true
		}
		return v2.GreaterThanOrEqual(v1)
	}
}
