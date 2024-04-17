package domain

type (
	// Object represents a domain object
	// We can define common behavior for all domain objects here
	Object interface {
		Validate() error
	}
)
