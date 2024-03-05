package validation

import (
	"fmt"
	"github.com/expr-lang/expr"
	"gitlab.com/shar-workflow/shar/model"
	"strings"
)

// ValidateTaskSpec validates a task spec.
func ValidateTaskSpec(td *model.TaskSpec) error {
	if td.Version != "1.0" {
		return fmt.Errorf("spec version %s not found: %w", td.Version, ErrTaskSpecVersion)
	}

	// Metadata
	if td.Metadata == nil {
		return fmt.Errorf("task metadata section not found: %w", ErrServiceTaskNoMetadata)
	}
	if err := validName(td.Metadata.Type); err != nil {
		return fmt.Errorf("task type name is not valid: %w", err)
	}
	if err := validVersion(td.Metadata.Version); err != nil {
		return fmt.Errorf("task version is not valid: %w", err)
	}

	// Behaviour
	if td.Behaviour == nil {
		return fmt.Errorf("task behaviour section not found: %w", ErrServiceTaskNoMetadata)
	}

	if td.Behaviour.EstimatedMaxDuration == 0 {
		return fmt.Errorf("task estimated duration not provided: %w", ErrServiceTaskDuration)
	}

	if td.Behaviour.DefaultRetry == nil {
		return fmt.Errorf("no default retry given: %w", ErrNoDefaultRetry)
	}

	if retry := td.Behaviour.DefaultRetry; retry != nil {
		if retry.DefaultExceeded == nil {
			return fmt.Errorf("no default exceeded behaviour given for retry: %w", ErrNoDefaultRetry)
		}
		if retry.IntervalMilli == 0 {
			return fmt.Errorf("the retry interval must be non-zero: %w", ErrNoDefaultRetry)
		}
		if retry.MaxMilli == 0 || retry.MaxMilli <= retry.IntervalMilli {
			return fmt.Errorf("the retry interval must be non-zero and larger than ther interval: %w", ErrInvalidRetry)
		}
	}

	// Parameters
	if td.Parameters != nil && td.Parameters.Input != nil {
		for _, v := range td.Parameters.Input {
			if v.ValidateExpr != "" {
				ex := strings.TrimPrefix(v.ValidateExpr, "=")
				if _, err := expr.Compile(ex); err != nil {
					return fmt.Errorf("%s has a bad validation expression: %w", v.Name, err)
				}
			}
			if err := validExpName(v.Name); err != nil {
				return fmt.Errorf("input name '%s'is not valid: %w", v.Name, err)
			}
			if v.Example == "" {
				if td.Behaviour.Mock {
					return fmt.Errorf("task is placeholder, but no example was given: %w", ErrServiceMockValue)
				}
			} else {
				ex := strings.TrimPrefix(v.Example, "=")
				if _, err := expr.Compile(ex); err != nil {
					return fmt.Errorf("example value for '%s'is not valid: %w", v.Name, err)
				}
			}
		}
	}

	return nil
}

func validVersion(version string) error {
	return nil
}

func validName(name string) error {
	if !validNATSName(name) {
		return fmt.Errorf("bad name: %w", ErrServiceTaskNatsName)
	}
	return nil
}

func validExpName(name string) error {
	valid := "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_"
	for i := 0; i < len(name); i++ {
		if !strings.ContainsAny(string(name[i]), valid) {
			return fmt.Errorf("name may not contain '%s'", string(name[i]))
		}
	}
	if strings.ContainsAny(string(name[0]), "0123456789") {
		return fmt.Errorf("name may not start with a digit")
	}
	return nil
}

func validNATSName(name string) bool {
	return !strings.ContainsAny(name, ". ")
}
