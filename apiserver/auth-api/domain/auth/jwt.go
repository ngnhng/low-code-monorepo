package auth

import (
	"github.com/golang-jwt/jwt/v4"
)

type JwtCustomClaims struct {
	Email            string               `json:"email"`
	Role             string               `json:"role"`
	RegisteredClaims jwt.RegisteredClaims `json:"registered_claims"`
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
