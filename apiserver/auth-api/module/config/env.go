package config

import (
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"reflect"
	"strings"

	"github.com/spf13/viper"
)

// TODO
func NewProductionEnv() (*Env, error) {
	return NewLocalEnv(&LocalConfigReader{})
}

// NewLocalEnv reads in config from a local file or from the search paths.
// If a filepath is provided, it will read in the config from that file instead of searching.
// If no filepath is provided, it will search for a file named server-config.yaml in the search paths.
func NewLocalEnv(reader *LocalConfigReader) (*Env, error) {
	v := viper.New()

	if reader.filePath != "" {
		v.SetConfigFile(reader.filePath)
	} else {
		//for _, sp := range reader.searchPaths {
		//	v.AddConfigPath(sp)
		//}
		//if reader.fileName != "" {
		//	v.SetConfigName(reader.fileName)
		//}
		////if reader.fileType != "" {
		////	v.SetConfigType(reader.fileType)
		////}
		cwd, err := os.Getwd()
		if err != nil {
			return nil, err
		}
		log.Println("CWD: ", cwd)
		filePath, err := filepath.Abs(filepath.Join(cwd, reader.fileName+"."+reader.fileType))
		if err != nil {
			return nil, err
		}
		log.Println(filePath)
		v.SetConfigFile(filePath)
	}

	bindEnvsAndDefaults(v, defaultConfig)

	if reader.filePath != "" || len(reader.searchPaths) > 0 {
		if err := v.ReadInConfig(); err != nil {
			if !errors.As(err, &viper.ConfigFileNotFoundError{}) {
				return &Env{}, fmt.Errorf("could not read in config from viper: %w", err)
			}
		}
	} else {
		return nil, fmt.Errorf("no config file specified")
	}
	// Could handle cases where config file is .env -- but not necessary
	//if strings.HasSuffix(v.ConfigFileUsed(), ".env") {
	//	for _, key := range v.AllKeys() {
	//		v.Set(strings.ReplaceAll(key, "_", "."), v.Get(key))
	//	}
	//	for _, key := range v.AllKeys() {
	//		v.Set(key, v.Get(strings.ToUpper(strings.ReplaceAll(key, ".", "_"))))
	//	}
	//}

	log.Println("USING CONFIG: ", v.ConfigFileUsed())

	var cfg *Env
	if err := v.Unmarshal(&cfg); err != nil {
		return &Env{}, fmt.Errorf("could not unmarshal loaded viper config: %w", err)
	}

	return cfg, nil
}

func bindEnvsAndDefaults(vi *viper.Viper, iface interface{}, parts ...string) {
	// recursively traverse the provided type to construct the config
	ifv := reflect.ValueOf(iface)
	ift := reflect.TypeOf(iface)
	for i := 0; i < ift.NumField(); i++ {
		v := ifv.Field(i)
		t := ift.Field(i)

		tv, ok := t.Tag.Lookup("mapstructure")
		if !ok {
			continue
		}
		switch v.Kind() {
		case reflect.Struct:
			bindEnvsAndDefaults(vi, v.Interface(), append(parts, tv)...)
		default:
			p := strings.Join(append(parts, tv), ".")
			bindEnv(vi, p)
			setDefault(vi, p, v.Interface())
		}
	}
}

func setDefault(vi *viper.Viper, key string, value interface{}) {
	if !reflect.ValueOf(value).IsZero() {
		vi.SetDefault(key, value)
	}
}

func bindEnv(vi *viper.Viper, key string) {
	envVar := strings.ReplaceAll(key, ".", "_")
	envVar = strings.ToUpper(strings.Trim(envVar, " "))

	vi.BindEnv(key, envVar)
}
