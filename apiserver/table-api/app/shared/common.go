package shared

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	"yalc/dbms/domain"

	"github.com/google/uuid"
	"github.com/lithammer/shortuuid/v4"
	"github.com/shopspring/decimal"

	pgxdecimal "github.com/jackc/pgx-shopspring-decimal"
	"github.com/jackc/pgx/v5"
)

type (
	UserContextKey string
)

const (
	UserKey = UserContextKey("USER_CTX")
	// Has to be 57 characters long, here i eliminated some characters that could be confused with others (like 0 and O)
	ColumnIdAlphabet = "abcdefghijklmnopqrstuvwxyz123456789ABCDEFGHJKLMNPQRSTUVXZ"
)

type (
	RequestContext interface {
		GetUserId() string
		GetContext() context.Context
	}
)

func GenerateDatabaseName(projectId, userId string) string {
	return userId + "_" + projectId
}

// GenerateColumnId generates a column id to be used in the database
// Rules: Cannot start with a number, cannot contain special characters
// and must be unique
func GenerateColumnId() string {
	t := shortuuid.NewWithAlphabet(ColumnIdAlphabet)
	// Cannot start with a number
	for t[0] >= '0' && t[0] <= '9' {
		t = shortuuid.NewWithAlphabet(ColumnIdAlphabet)
	}
	return t
}

func ColumnToPostgresType(columnType *domain.ColumnType) string {
	switch *columnType {
	case domain.ColumnTypeBoolean:
		return "BOOLEAN"
	case domain.ColumnTypeCurrency:
		// opinionated choice
		return "NUMERIC(19,4)"
	case domain.ColumnTypeDate:
		return "DATE"
	case domain.ColumnTypeInteger:
		return "INTEGER"
	case domain.ColumnTypeString:
		return "TEXT"
	case domain.ColumnTypeDateTime:
		// use with time zone since data is user generated
		return "TIMESTAMP WITH TIME ZONE"
	case domain.ColumnTypeTime:
		return "TIME"
	case domain.ColumnTypeLink:
		return "JSONB"
	default:
		// Handle unknown column types
		return "TEXT"
	}
}

func GenerateUUIDv4() string {
	return uuid.New().String()
}

// ReplacePlaceholders replaces ? placeholders in a SQL query with $1, $2, etc.
func ReplacePlaceholders(sql string) string {
	n := strings.Count(sql, "?")
	for i := 1; i <= n; i++ {
		sql = strings.Replace(sql, "?", fmt.Sprintf("$%d", i), 1)
	}
	return sql
}

func RegisterDecimalType(ctx context.Context, conn *pgx.Conn) error {
	pgxdecimal.Register(conn.TypeMap())
	return nil
}

func InSlice[id comparable](needle id, haystack []id) bool {
	log.Println("InSlice", needle, haystack)
	for _, v := range haystack {
		if v == needle {
			return true
		}
	}
	return false
}

func ParseValue(colType domain.ColumnType, v string) (interface{}, error) {

	if v == "" {
		return nil, fmt.Errorf("value is empty")
	}

	// if v is not empty, try to parse it
	switch colType {
	case domain.ColumnTypeBoolean:
		return strconv.ParseBool(v)
	case domain.ColumnTypeCurrency:
		return decimal.NewFromString(v)
	case domain.ColumnTypeDate:
		return time.Parse("2006-01-02", v)
	case domain.ColumnTypeInteger:
		return strconv.ParseInt(v, 10, 64)
	case domain.ColumnTypeString:
		return fmt.Sprintf("'%s'", v), nil
	case domain.ColumnTypeTime:
		return time.Parse("15:04:05", v)
	case domain.ColumnTypeDateTime:
		return time.Parse("2006-01-02 15:04:05", v)
	case domain.ColumnTypeLink:
		val, err := json.Marshal(v)
		if err != nil {
			return nil, err
		}
		return val, nil
	default:
		return nil, fmt.Errorf("unknown column type: %v", colType)
	}
}

func ParseNullOperator(colType domain.ColumnType) string {
	switch colType {
	case domain.ColumnTypeString:
		return "null::text"
	case domain.ColumnTypeInteger:
		return "null::integer"
	case domain.ColumnTypeDate:
		return "null::date"
	case domain.ColumnTypeTime:
		return "null::time"
	case domain.ColumnTypeDateTime:
		return "null::timestamp"
	case domain.ColumnTypeBoolean:
		return "null::boolean"
	case domain.ColumnTypeCurrency:
		return "null::numeric"
	case domain.ColumnTypeLink:
		return `null::jsonb`
	default:
		return "null::text"
	}
}
