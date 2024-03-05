package util

import (
	"testing"
	"time"

	"crypto/rand"
	"encoding/hex"
	user "yalc/auth-service/domain/user"
)

var (
	// Generate a random secret for testing. 32 bytes = 256 bits
	secret = generateRandomSecret(32)
)

func generateRandomSecret(length int) string {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		panic(err) // handle error appropriately in your code
	}
	return hex.EncodeToString(bytes)
}

func TestCreateAccessToken(t *testing.T) {
	user := &user.User{Email: "test@example.com"}

	expiration := time.Hour

	token, err := CreateAccessToken(user, secret, time.Now().Add(expiration))
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if token == "" {
		t.Fatalf("expected token to be non-empty")
	}

	// Add more tests as needed...
}

func TestCreateRefreshToken(t *testing.T) {
	user := &user.User{Email: "test@example.com"}
	expiration := time.Hour

	token, err := CreateRefreshToken(user, secret, expiration)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if token == "" {
		t.Fatalf("expected token to be non-empty")
	}

	// Add more tests as needed...
}

func TestCreateAndValidateAT(t *testing.T) {
	user := &user.User{
		Email:        "test@gmail.com",
		FirstName:    "test",
		LastName:     "test",
		ProfileImage: "test",
	}

	expiration := time.Hour

	accessToken, err := CreateAccessToken(user, secret, time.Now().Add(expiration))

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	// Validate the token
	_, err = ValidateToken(accessToken, secret)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}
