package config

import (
	"fmt"
	"os"

	"yalc/auth-service/shared/constant"
)

type (
	Config struct {
		Env
	}

	ConfigReader interface {
		ReadConfig() (*Config, error)
		SetFilePath(filePath string)
	}

	RemoteConfigReader struct {
	}

	LocalConfigReader struct {
		filePath string

		fileName    string
		fileType    string
		searchPaths []string
	}
)

var _ ConfigReader = &LocalConfigReader{}

func NewConfig() (*Config, error) {
	configReader, err := NewConfigReader(os.Getenv(constant.ENVIRONMENT))
	if err != nil {
		panic(err)
	}

	cfg, err := configReader.ReadConfig()
	if err != nil {
		panic(err)
	}

	return cfg, nil
}

func (r *RemoteConfigReader) ReadConfig() (*Config, error) {
	// Read production config file
	return &Config{}, nil
}

func (r *RemoteConfigReader) SetFilePath(filePath string) {
	// Do nothing
}

func (r *LocalConfigReader) ReadConfig() (*Config, error) {
	// Search for config file in searchPaths and read it
	env, err := NewLocalEnv(r)
	if err != nil {
		return nil, err
	}

	return &Config{*env}, nil
}

func (r *LocalConfigReader) SetFilePath(filePath string) {
	r.filePath = filePath
}

func NewConfigReader(env string) (ConfigReader, error) {
	switch env {
	case string(constant.Prod):
		return &RemoteConfigReader{}, nil
	case string(constant.Dev):
		//cwd, err := filepath.Abs(".")
		//if err != nil {
		//	return nil, err
		//}
		//filePath, err := filepath.Abs(filepath.Join(cwd, "config_dev.json"))
		//if err != nil {
		//	return nil, err
		//}
		searchPaths := []string{".", "../.."}
		return &LocalConfigReader{
			//filePath:    filePath,
			fileName:    constant.CONFIG_FILE_NAME,
			fileType:    "json",
			searchPaths: searchPaths,
		}, nil
	default:
		return nil, fmt.Errorf("unknown environment: %s", env)
	}
}
