package valueparsing

import (
	"fmt"
	errors2 "gitlab.com/shar-workflow/shar/server/errors"
	"regexp"
	"strconv"
	"strings"

	"gitlab.com/shar-workflow/shar/model"
)

// Parse parses a set, and turns an array of typed parameters into a corresponding map of shar workflow variables.
func Parse(arr []string) (*model.Vars, error) {
	vars := model.Vars{}
	for _, elem := range arr {
		key, varType, value, err := extract(elem)
		if err != nil {
			return nil, fmt.Errorf("extract variables: %w", err)
		}
		switch varType {
		case "int":
			intVal, err := strconv.Atoi(value)
			if err != nil {
				return nil, fmt.Errorf("parse int: %w", err)
			}
			vars[key] = intVal
		case "float32":
			float32Value, err := strconv.ParseFloat(value, 32)
			if err != nil {
				return nil, fmt.Errorf("parse float32: %w", err)
			}
			vars[key] = float32(float32Value)
		case "float64":
			float64Value, err := strconv.ParseFloat(value, 64)
			if err != nil {
				return nil, fmt.Errorf("parse float64: %w", err)
			}
			vars[key] = float64Value
		case "string":
			vars[key] = value
		case "bool":
			vars[key], err = strconv.ParseBool(value)
			if err != nil {
				return nil, fmt.Errorf("parse bool: %w", err)
			}
		}
	}
	return &vars, nil
}

func extract(text string) (string, string, string, error) {
	re := regexp.MustCompile(`([\"A-Za-z0-9]*):([A-Za-z0-9]*)\((.*)\)`)
	arr := re.FindAllStringSubmatch(text, -1)
	if len(arr) > 0 && len(arr[0]) > 3 {
		key := arr[0][1]
		value := arr[0][3]
		varType := arr[0][2]
		if !strings.HasPrefix(key, "") || !strings.HasSuffix(key, "") {
			return "", "", "", fmt.Errorf("identifier %s not correctly quoted: %w", text, errors2.ErrBadlyQuotedIdentifier)
		}
		return strings.Trim(key, "\""), varType, value, nil
	}
	return "", "", "", fmt.Errorf("extract var from %s: %w", text, errors2.ErrExtractingVar)

}
