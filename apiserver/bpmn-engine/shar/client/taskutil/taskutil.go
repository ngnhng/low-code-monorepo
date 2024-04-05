package taskutil

import (
	"context"
	"fmt"
	"github.com/goccy/go-yaml"
	"gitlab.com/shar-workflow/shar/client"
	"gitlab.com/shar-workflow/shar/model"
	"os"
)

// RegisterTaskYamlFile registers a service task with a task spec.
func RegisterTaskYamlFile(ctx context.Context, cl *client.Client, yamlFile string, fn client.ServiceFn) error {
	sb, err := os.ReadFile(yamlFile)
	if err != nil {
		return fmt.Errorf("register task yaml file: %w", err)
	}
	if err = RegisterTaskYaml(ctx, cl, sb, fn); err != nil {
		return fmt.Errorf("RegisterTaskYamlFile: %w", err)
	}
	return nil
}

func loadSpecFromBytes(c *client.Client, buf []byte) (*model.TaskSpec, error) {
	spec := &model.TaskSpec{}
	err := yaml.Unmarshal(buf, spec)
	if err != nil {
		return nil, fmt.Errorf("failed to parse task spec: %w", err)
	}
	return spec, nil
}

// RegisterTaskYaml registers a service task with a task spec.
func RegisterTaskYaml(ctx context.Context, c *client.Client, taskYaml []byte, fn client.ServiceFn) error {
	yml, err := loadSpecFromBytes(c, taskYaml)
	if err != nil {
		return fmt.Errorf("RegisterTaskFromYaml: %w", err)
	}
	if err := c.RegisterTask(ctx, yml, fn); err != nil {
		return fmt.Errorf("RegisterTaskYaml: %w", err)
	}
	return nil
}
