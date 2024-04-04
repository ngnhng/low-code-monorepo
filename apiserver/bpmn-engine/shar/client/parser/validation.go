package parser

import (
	"fmt"
	"gitlab.com/shar-workflow/shar/common/element"
	"gitlab.com/shar-workflow/shar/common/expression"
	"gitlab.com/shar-workflow/shar/common/linter"
	"gitlab.com/shar-workflow/shar/model"
	errors2 "gitlab.com/shar-workflow/shar/server/errors"
	"regexp"
)

func validModel(workflow *model.Workflow) error {
	// Iterate the processes
	for _, i := range workflow.Process {
		// Check the name
		if err := validName(i.Name); err != nil {
			return fmt.Errorf("invalid process name: %w", err)
		}
		// Iterate through the elements
		for _, j := range i.Elements {
			if j.Id == "" {
				return fmt.Errorf("model validation failed: %w", &valError{Err: errors2.ErrMissingID, Context: j.Name})
			}
			switch j.Type {
			case element.ServiceTask:
				if err := validServiceTask(j); err != nil {
					return fmt.Errorf("invalid service task: %w", err)
				}
			case element.Gateway:
				if j.Gateway.Direction == model.GatewayDirection_convergent && j.Gateway.ReciprocalId == "" {
					return fmt.Errorf("gateway %s(%s) has no opening gateway: %w", j.Name, j.Id, linter.ErrMissingOpeningGateway)
				}
			}
		}
		if err := checkVariables(i); err != nil {
			return fmt.Errorf("invalid variable definition: %w", err)
		}
	}
	for _, i := range workflow.Messages {
		if err := validName(i.Name); err != nil {
			return fmt.Errorf("invalid message name: %w", err)
		}
	}
	return nil
}

func checkVariables(process *model.Process) error {
	inputVars := make(map[string]struct{})
	outputVars := make(map[string]struct{})
	condVars := make(map[string]struct{})
	for _, e := range process.Elements {
		if e.InputTransform != nil {
			for _, exp := range e.InputTransform {
				v2, err := expression.GetVariables(exp)
				if err != nil {
					return fmt.Errorf("get input transform variables: %w", err)
				}
				for k := range v2 {
					inputVars[k] = struct{}{}
				}
			}
		}
		if e.OutputTransform != nil {
			for exp := range e.OutputTransform {
				v2, err := expression.GetVariables("=" + exp)
				if err != nil {
					return fmt.Errorf("get output transform variables: %w", err)
				}
				for k := range v2 {
					outputVars[k] = struct{}{}
				}
			}
		}
		if e.Outbound != nil {
			for _, t := range e.Outbound.Target {
				for _, c := range t.Conditions {
					v2, err := expression.GetVariables(c)
					if err != nil {
						return fmt.Errorf("falied to get outbound variables: %w", err)
					}
					for k := range v2 {
						condVars[k] = struct{}{}
					}
				}
			}
		}
		if len(e.Errors) > 0 {
			for _, t := range e.Errors {
				for exp := range t.OutputTransform {
					v2, err := expression.GetVariables("=" + exp)
					if err != nil {
						return fmt.Errorf("get error variables: %w", err)
					}
					for k := range v2 {
						outputVars[k] = struct{}{}
					}
				}
			}
		}
	}

	//Test that inputs are all defined
	for i := range inputVars {
		if _, ok := outputVars[i]; !ok {
			return fmt.Errorf("the undefined variable \"%s\" is referred to as input: %w", i, errors2.ErrUndefinedVariable)
		}
	}
	for i := range condVars {
		if _, ok := outputVars[i]; !ok {
			return fmt.Errorf("the undefined variable \"%s\" is referred to in a condition: %w", i, errors2.ErrUndefinedVariable)
		}
	}
	return nil
}

type valError struct {
	Err     error
	Context string
}

func (e valError) Error() string {
	return fmt.Sprintf("%s: %s\n", e.Err.Error(), e.Context)
}

//goland:noinspection GoUnnecessarilyExportedIdentifiers
func (e valError) Unwrap() error {
	return e.Err
}

func validServiceTask(j *model.Element) error {
	if j.Execute == "" {
		return fmt.Errorf("service task validation failed: %w", &valError{Err: errors2.ErrMissingServiceTaskDefinition, Context: j.Id})
	}
	return nil
}

var validKeyRe = regexp.MustCompile(`\A[-/_=\.a-zA-Z0-9]+\z`)

// is a NATS compatible name
func validName(name string) error {
	if len(name) == 0 || name[0] == '.' || name[len(name)-1] == '.' {
		return fmt.Errorf("'%s' contains invalid characters when used with SHAR", name)
	}
	if !validKeyRe.MatchString(name) {
		return fmt.Errorf("'%s' contains invalid characters when used with SHAR", name)
	}
	return nil
}
