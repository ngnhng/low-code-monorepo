package domain

import "errors"

type (
	// Object represents a domain object
	// We can define common behavior for all domain objects here
	Object interface {
		// Validate validates the domain object and returns an error if it is not valid
		// This method should be implemented by all domain objects
		// We can use this as a Validator for HTTP server.
		Validate() error
	}
)

// NewError is a function that returns a new error
func NewError(msg string) error {
	return errors.New(msg)
}

var (
	_ Object = (*CreateTableRequest)(nil)
	_ Object = (*InsertRowRequest)(nil)
	_ Object = (*UpdateRowRequest)(nil)
	_ Object = (*DeleteRowRequest)(nil)
	_ Object = (*CreateColumnRequest)(nil)
	_ Object = (*Column)(nil)
	_ Object = (*Table)(nil)
	_ Object = (*Column)(nil)
	_ Object = (*Rule)(nil)
)
