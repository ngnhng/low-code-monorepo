package auth

import (
	"github.com/golang-jwt/jwt/v4"
)

type JwtCustomClaims struct {
	FirstName            string `json:"first_name"`
	LastName             string `json:"last_name"`
	Email                string `json:"email"`
	Role                 string `json:"role"`
	ProfileImage         string `json:"profile_image"`
	jwt.RegisteredClaims `json:"registered_claims"`
}

type JwtCustomRefreshClaims struct {
	Email            string               `json:"email"`
	RegisteredClaims jwt.RegisteredClaims `json:"registered_claims"`
}

func (j *JwtCustomClaims) Valid() error {
	return j.RegisteredClaims.Valid()
}

func (j *JwtCustomRefreshClaims) Valid() error {
	return j.RegisteredClaims.Valid()
}
