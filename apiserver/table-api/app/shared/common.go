package shared

import (
	"context"
	"crypto/sha1"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"
	"unicode"

	"yalc/dbms/domain"

	"github.com/google/uuid"
	"github.com/lithammer/shortuuid/v4"
	"github.com/shopspring/decimal"

	pgxdecimal "github.com/jackc/pgx-shopspring-decimal"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
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
	length := 10
	prefix := "c"

	t := shortuuid.NewWithAlphabet(ColumnIdAlphabet)
	// Cannot start with a number
	for t[0] >= '0' && t[0] <= '9' {
		t = shortuuid.NewWithAlphabet(ColumnIdAlphabet)
	}

	// lowercase the id
	t = strings.ToLower(t)

	if len(t) > length {
		return prefix + string(t[:length])
	}

	// append prefix to the id
	return prefix + t
}

// GenerateTableId generates a table id to be used in the database
// Example: m1a2b3c4d5e6f7g8h9i0
func GenerateTableId() string {
	length := 10
	prefix := "m"
	t := shortuuid.NewWithAlphabet(ColumnIdAlphabet)
	// Cannot start with a number
	for t[0] >= '0' && t[0] <= '9' {
		t = shortuuid.NewWithAlphabet(ColumnIdAlphabet)
	}

	// lowercase the id
	t = strings.ToLower(t)

	if len(t) > length {
		return prefix + string(t[:length])
	}

	// append prefix to the id
	return prefix + t
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
	case domain.ColumnTypePrimaryKey:
		return "SERIAL PRIMARY KEY"
	case domain.ColumnTypeForeignKey:
		return "INTEGER"
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
		//return strconv.ParseBool(v)
		b := pgtype.Bool{}
		b.Bool = v == "true"
		b.Valid = true
		return b, nil
	case domain.ColumnTypeCurrency:
		return decimal.NewFromString(v)
	case domain.ColumnTypeDate:
		//return time.Parse("2006-01-02", v)
		d := pgtype.Date{}
		d.Time, _ = time.Parse("2006-01-02", v)
		d.Valid = true

		return d, nil

	case domain.ColumnTypeInteger:
		//return strconv.ParseInt(v, 10, 64)
		i := pgtype.Int8{}
		r, err := strconv.ParseInt(v, 10, 64)
		if err != nil {
			return nil, err
		}
		i.Int64 = r
		i.Valid = true
		return i, nil

	case domain.ColumnTypeString:
		//return fmt.Sprintf("'%s'", v), nil
		s := pgtype.Text{}
		s.String = v
		s.Valid = true
		return s, nil
	case domain.ColumnTypeTime:
		//return time.Parse("15:04:05", v)
		t := pgtype.Time{}
		// get ms from time
		ms, err := time.Parse("15:04:05", v)
		if err != nil {
			return nil, err
		}
		// microseconds is time elapsed since midnight
		t.Microseconds = int64(ms.Hour()*3600+ms.Minute()*60+ms.Second()) * 1000
		t.Valid = true
		return t, nil

	case domain.ColumnTypeDateTime:
		//return time.Parse("2006-01-02 15:04:05", v)
		dt := pgtype.Timestamptz{}
		t, err := time.Parse("2006-01-02 15:04:05", v)
		if err != nil {
			return nil, err
		}
		dt.Time = t
		dt.Valid = true

		return dt, nil

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

func ParseNullOperatorV2(colType domain.ColumnType) any {
	switch colType {
	case domain.ColumnTypeString:
		return sql.Null[string]{}
	case domain.ColumnTypeInteger:
		return sql.Null[int64]{}
	case domain.ColumnTypeDate:
		return sql.Null[time.Time]{}
	case domain.ColumnTypeTime:
		return sql.Null[time.Time]{}
	case domain.ColumnTypeDateTime:
		return sql.Null[time.Time]{}
	case domain.ColumnTypeBoolean:
		return sql.Null[bool]{}
	case domain.ColumnTypeCurrency:
		return sql.Null[decimal.Decimal]{}
	case domain.ColumnTypeLink:
		return sql.Null[string]{}
	default:
		return sql.Null[string]{}
	}
}

// NormalizeStringForPostgres normalizes a string for use in a postgres query
// Lowercases the string and replaces spaces with 1 underscore
// Special characters are removed
// Uppercase after lowercase lower cased and added an underscore between them
func NormalizeStringForPostgres(s string) string {

	// Replace spaces with underscores
	s = strings.ReplaceAll(s, " ", "_")

	// Remove special characters
	reg, _ := regexp.Compile("[^A-Za-z0-9_]+")
	s = reg.ReplaceAllString(s, "")

	// Add an underscore between lowercase and uppercase letters
	s = addUnderscoreBeforeCapitals(s)

	return s
}

// addUnderscoreBeforeCapitals adds 2 underscore before each capital letter in a string
func addUnderscoreBeforeCapitals(s string) string {
	runes := []rune(s)
	result := make([]rune, 0, len(runes))

	for i, r := range runes {
		if i > 0 && unicode.IsUpper(r) {
			result = append(result, '_', '_')
		}
		result = append(result, unicode.ToLower(r))
	}

	return string(result)
}

func GenerateMMTableName(table1, table2 string) string {
	// Sort the strings
	tables := []string{table1, table2}
	sort.Strings(tables)

	// Concatenate the sorted strings
	concat := tables[0] + tables[1]

	// Hash the concatenated string
	hasher := sha1.New()
	hasher.Write([]byte(concat))
	hash := hex.EncodeToString(hasher.Sum(nil))

	// Use the first 8 characters of the hash
	shortHash := hash[:8]

	return fmt.Sprintf("yalc_mm_%s", shortHash)
}

func GenerateTableName(label string) string {
	prefix := `yalc_table`

	s := NormalizeStringForPostgres(label)

	return fmt.Sprintf("%s_%s", prefix, s)
}
