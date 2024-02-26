package util

import (
	"errors"
	"time"

	"golang.org/x/crypto/bcrypt"

	auth "yalc/auth-service/domain/auth"
	user "yalc/auth-service/domain/user"

	jwt "github.com/golang-jwt/jwt/v4"
)

const (
	bearerPrefix = "Bearer "
)

func CreateAccessToken(user *user.User, secret string, expiration time.Time) (accessToken string, err error) {
	claims := &auth.JwtCustomClaims{
		FirstName:    user.FirstName,
		LastName:     user.LastName,
		Email:        user.Email,
		Role:         "webuser",
		ProfileImage: user.ProfileImage,
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  &jwt.NumericDate{Time: time.Now()},
			ExpiresAt: &jwt.NumericDate{Time: expiration},
			Issuer:    "yalc-api",
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	t, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", err
	}
	return t, err
}

func CreateRefreshToken(user *user.User, secret string, expiration time.Duration) (refreshToken string, err error) {
	exp := time.Now().Add(expiration)
	claimsRefresh := &auth.JwtCustomRefreshClaims{
		Email: user.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: &jwt.NumericDate{Time: exp},
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claimsRefresh)
	rt, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", err
	}
	return rt, err
}

func CheckPasswordHash(password string, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func ValidateToken(tokenString string, secret string) (*jwt.Token, error) {
	token, err := jwt.ParseWithClaims(tokenString, &auth.JwtCustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil {
		return nil, err
	}
	return token, nil
}

func ExtractToken(authHeader string) (string, error) {
	if authHeader == "" {
		return "", errors.New("no token provided")
	}

	if len(authHeader) > len(bearerPrefix) && authHeader[:len(bearerPrefix)] == bearerPrefix {
		return authHeader[len(bearerPrefix):], nil
	}

	return "", errors.New("invalid authorization header")
}
