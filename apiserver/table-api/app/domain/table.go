package domain

import (
	"log"

	validation "github.com/go-ozzo/ozzo-validation/v4"
)

type (
	CreateTableRequest struct {
		Table Table `json:"table"`
	}

	ListTableResponse struct {
		Tables []Table `json:"tables"`
	}
)

type (
	Table struct {
		TID     string   `json:"tid,omitempty"`
		Name    string   `json:"name"`
		Columns []Column `json:"columns"`
	}

	Column struct {
		Id        string           `json:"id,omitempty"`
		Name      string           `json:"name"`
		Type      ColumnType       `json:"type"`
		Reference *ColumnReference `json:"reference,omitempty"`
	}

	ColumnType string

	ColumnReference struct {
		TableId  string `json:"table_id,omitempty"`
		ColumnId string `json:"column_id,omitempty"`
	}
)

const (
	ColumnTypePrimaryKey ColumnType = "primary_key"
	ColumnTypeBoolean    ColumnType = "boolean"
	ColumnTypeCurrency   ColumnType = "currency"
	ColumnTypeDate       ColumnType = "date"
	ColumnTypeInteger    ColumnType = "integer"
	ColumnTypeString     ColumnType = "string"
	ColumnTypeTime       ColumnType = "time"
	ColumnTypeDateTime   ColumnType = "datetime"
	ColumnTypeLink       ColumnType = "link"
)

var (
	ErrColumnNameEmpty   = NewError("column name is empty")
	ErrColumnTypeEmpty   = NewError("column type is empty")
	ErrTableNameEmpty    = NewError("table name is empty")
	ErrTableColumnsEmpty = NewError("table columns are empty")
	ErrDatabaseNameEmpty = NewError("database name is empty")
)

func (t *Table) Validate() error {
	return validation.ValidateStruct(t,
		validation.Field(&t.Name, validation.Required, validation.Length(1, 255)),
		validation.Field(&t.Columns, validation.Required, validation.Each(validation.By(func(value interface{}) error {
			c, ok := value.(Column)
			if !ok {
				return ErrTableColumnsEmpty
			}

			if err := c.Validate(); err != nil {
				return err
			}

			return nil
		})),
		),
	)
}

func (c *Column) Validate() error {
	log.Println("Column.Validate")
	return validation.ValidateStruct(c,
		validation.Field(&c.Name, validation.Required, validation.Length(1, 255)),
		validation.Field(&c.Type, validation.Required, validation.In(
			ColumnTypePrimaryKey, ColumnTypeBoolean, ColumnTypeCurrency, ColumnTypeDate, ColumnTypeInteger, ColumnTypeString, ColumnTypeTime, ColumnTypeDateTime, ColumnTypeLink,
		),
		),
	)
}

//func (c *ColumnType) Validate() error {
//	log.Println("ColumnType.Validate")
//	switch *c {
//	case ColumnTypePrimaryKey, ColumnTypeBoolean, ColumnTypeCurrency, ColumnTypeDate, ColumnTypeInteger, ColumnTypeString, ColumnTypeTime, ColumnTypeDateTime, ColumnTypeLink:
//		return nil
//	default:
//		return ErrColumnTypeEmpty
//	}
//}

func (r *CreateTableRequest) Validate() error {
	return validation.ValidateStruct(r,
		validation.Field(&r.Table, validation.Required, validation.By(func(value interface{}) error {
			t, ok := value.(Table)
			if !ok {
				return ErrTableColumnsEmpty
			}

			if err := t.Validate(); err != nil {
				return err
			}

			return nil
		}),
		),
	)
}
