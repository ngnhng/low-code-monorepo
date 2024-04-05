package model

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

type person struct {
	Friends []string
	Age     int
	Address struct {
		HouseNumber int
		Postcode    string
	}
}

func TestMarshalUnmarshal(t *testing.T) {
	v := make(Vars)

	p := person{
		Friends: []string{"John", "Fred"},
		Age:     40,
		Address: struct {
			HouseNumber int
			Postcode    string
		}{
			HouseNumber: 21,
			Postcode:    "CO1 1AA",
		},
	}

	err := Marshal(&v, "person", &p)
	assert.NoError(t, err)
	n, err := Unmarshal[person](v, "person")
	assert.NoError(t, err)
	assert.Equal(t, *n, p)
}
