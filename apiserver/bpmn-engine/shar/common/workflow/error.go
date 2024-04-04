package workflow

import (
	"fmt"
)

// Error describes a workflow error by code or name
type Error struct {
	Code         string
	WrappedError error
}

func (e Error) Error() string {
	var we string
	if e.WrappedError != nil {
		we = e.WrappedError.Error()
	}
	return fmt.Sprintf("%s: %s", e.Code, we)
}
