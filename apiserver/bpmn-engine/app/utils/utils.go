package utils

import (
	"context"
	"fmt"
	"yalc/bpmn-engine/domain"

	"github.com/golang-jwt/jwt/v5"
)

// GetTokenFromContext returns the token from the context.
func GetTokenFromContext(ctx context.Context) *jwt.Token {
	if ctx == nil {
		return nil
	}
	return ctx.Value(domain.UserKey).(*jwt.Token)
}

// GetEmailFromContext returns the email from the context.
func GetEmailFromContext(ctx context.Context) (string, error) {
	token := GetTokenFromContext(ctx)
	if token == nil {
		return "", fmt.Errorf("token not found in context")
	}
	claims := token.Claims.(jwt.MapClaims)
	email, ok := claims["email"].(string)
	if !ok {
		return "", fmt.Errorf("email not found in token")
	}

	return email, nil
}
