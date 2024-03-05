package config

import (
	"flag"
	"fmt"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
)

var (
	filePathYaml = flag.String("fileYml", "", "path to YAML config file")
	filePathEnv  = flag.String("fileEnv", "", "path to ENV config file")
)

func TestReadYAMLConfig(t *testing.T) {
	// Parse the command-line flags
	flag.Parse()

	// Read the YAML config file
	configReader, err := NewConfigReader("development")
	if err != nil {
		t.Fatal(err)
	}

	// If the file path flag is set, use that file instead of the default file
	if *filePathYaml != "" {
		if filepath.IsAbs(*filePathYaml) {
			configReader.SetFilePath(*filePathYaml)
		} else {
			rootPath, err := filepath.Abs(".")
			if err != nil {
				t.Fatal(err)
			}
			configReader.SetFilePath(filepath.Join(rootPath, *filePathYaml))
		}
	}

	config, err := configReader.ReadConfig()
	if err != nil {
		t.Fatal(err)
	}

	fmt.Printf("%+v\n", config.Env.Database.Postgres)

	// Check that the config was read
	assert.NotEmpty(t, config)
}

func TestReadEnvConfig(t *testing.T) {
	// Parse the command-line flags
	flag.Parse()

	configReader, err := NewConfigReader("development")
	if err != nil {
		t.Fatal(err)
	}

	// If the file path flag is set, use that file instead of the default file
	if *filePathEnv != "" {
		if filepath.IsAbs(*filePathEnv) {
			configReader.SetFilePath(*filePathEnv)
		} else {
			rootPath, err := filepath.Abs(".")
			if err != nil {
				t.Fatal(err)
			}
			configReader.SetFilePath(filepath.Join(rootPath, *filePathEnv))
		}
	}

	config, err := configReader.ReadConfig()
	if err != nil {
		t.Fatal(err)
	}

	fmt.Printf("%+v\n", config)

	// Check that the config was read
	assert.NotEmpty(t, config)
}
