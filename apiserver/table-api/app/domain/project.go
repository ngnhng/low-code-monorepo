package domain

import (
	validation "github.com/go-ozzo/ozzo-validation/v4"
	is "github.com/go-ozzo/ozzo-validation/v4/is"
)

type (
	// Project represents a project
	Project struct {
		Id      int    `json:"id"`
		PID     string `json:"pid"` // External project ID (UUIDv4)
		Name    string `json:"title"`
		OwnerId int    `json:"userId"`
	}
)

// Validate validates the project and returns an error if it is not valid
func (p *Project) Validate() error {
	return validation.ValidateStruct(p,
		validation.Field(&p.PID, validation.Required, is.UUIDv4),
		validation.Field(&p.Name, validation.Required, validation.Length(1, 255)),
		validation.Field(&p.OwnerId, validation.Required),
	)
}
