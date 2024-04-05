package api

import "fmt"

// Error returns a GRPC error code and an error message
type Error struct {
	Code    int
	Message string
}

func (a Error) Error() string {
	return fmt.Sprintf("code %d: %s", a.Code, a.Message)
}
