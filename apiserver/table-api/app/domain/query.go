package domain

import (
	"log"

	validation "github.com/go-ozzo/ozzo-validation/v4"
)

var (
	// (1 = 1) rule, used as a default rule for the query
	DefaultRule = Rule{
		Combinator: CombinatorAnd,
		Not:        false,
		Rules:      []Rule{},
	}

	DefaultQuery = Query{
		Sql:    "(1 = 1)",
		Params: []interface{}{},
	}

	DefaultQueryLimit  = 100
	DefaultQueryOffset = 0

	DataTypeMap = map[uint32]ColumnType{
		16:   ColumnTypeBoolean,
		23:   ColumnTypeInteger,
		25:   ColumnTypeString,
		1082: ColumnTypeDate,
		1083: ColumnTypeTime,
		1184: ColumnTypeDateTime,
		1700: ColumnTypeCurrency,
		3802: ColumnTypeLink,
	}
)

type (
	GetTableDataResponse struct {
		Columns []Column   `json:"columns"`
		Rows    [][]string `json:"rows"`
	}

	InsertRow map[string]string

	InsertRowRequest struct {
		Rows []InsertRow `json:"rows"`
	}

	UpdateRow struct {
		RowId  string            `json:"id"`
		Values map[string]string `json:"values"`
	}

	UpdateRowRequest []UpdateRow

	DeleteRowRequest struct {
		RowIds []int `json:"ids"`
	}

	CreateColumnRequest struct {
		Columns []Column `json:"columns"`
	}

	DeleteColumnRequest struct {
		ColumnIds []string `json:"ids"`
	}
)

type (
	//QueryGroup struct {
	//	Combinator Combinator     `json:"combinator"`
	//	Not        bool           `json:"not"`
	//	Queries    []QueryElement `json:"rules"`
	//}

	Query struct {
		Sql    string        `json:"sql"`
		Params []interface{} `json:"params"`
	}

	//QueryElement interface{}

	Rule struct {
		Combinator Combinator `json:"combinator,omitempty"`
		Not        bool       `json:"not,omitempty"`
		Rules      []Rule     `json:"rules,omitempty"`
		Field      string     `json:"field,omitempty"`
		Operator   string     `json:"operator,omitempty"`
		Value      string     `json:"value,omitempty"`
	}

	Combinator string
	Operator   string
)

const (
	CombinatorAnd Combinator = "and"
	CombinatorOr  Combinator = "or"

	OperatorEqual          Operator = "="
	OperatorNotEqual       Operator = "!="
	OperatorIn             Operator = "in"
	OperatorNotIn          Operator = "notIn"
	OperatorLess           Operator = "<"
	OperatorLessOrEqual    Operator = "<="
	OperatorGreater        Operator = ">"
	OperatorGreaterOrEqual Operator = ">="
	OperatorContains       Operator = "contain"
	OperatorNotContains    Operator = "doesNotContain"
	OperatorBeginWith      Operator = "beginsWith"
	OperatorNotBeginWith   Operator = "doesNotBeginWith"
	OperatorEndWith        Operator = "endsWith"
	OperatorNotEndWith     Operator = "doesNotEndWith"
	OperatorIsNull         Operator = "isNull"
	OperatorIsNotNull      Operator = "isNotNull"
	OperatorBetween        Operator = "between"
	OperatorNotBetween     Operator = "notBetween"
)

func (r *Rule) Validate() error {
	return validation.ValidateStruct(r,
		validation.Field(&r.Combinator, validation.In(CombinatorAnd, CombinatorOr)),
		validation.Field(&r.Operator, validation.In(
			OperatorEqual, OperatorNotEqual, OperatorIn, OperatorNotIn,
			OperatorLess, OperatorLessOrEqual, OperatorGreater, OperatorGreaterOrEqual,
			OperatorContains, OperatorNotContains, OperatorBeginWith, OperatorNotBeginWith,
			OperatorEndWith, OperatorNotEndWith, OperatorIsNull, OperatorIsNotNull,
			OperatorBetween, OperatorNotBetween,
		)),
		validation.Field(&r.Field, validation.Required, validation.Length(1, 255)),
		validation.Field(&r.Value, validation.Required, validation.Length(1, 255)),
	)
}

func (r *UpdateRow) Validate() error {
	return validation.ValidateStruct(r,
		validation.Field(&r.RowId, validation.Required, validation.Length(1, 255)),
		validation.Field(&r.Values, validation.Required),
	)
}

func (o *UpdateRowRequest) Validate() error {
	return validation.ValidateStruct(o,
		validation.Field(&o, validation.Required, validation.Each(validation.By(func(value interface{}) error {
			r, ok := value.(*UpdateRow)
			if !ok {
				return validation.NewError("400", "invalid row")
			}

			if err := r.Validate(); err != nil {
				return err
			}

			return nil
		})),
		))
}

func (o *InsertRowRequest) Validate() error {
	return validation.ValidateStruct(o,
		validation.Field(
			&o.Rows,
			validation.Required,
			validation.Length(1, 1000),
		))
}

func (o *DeleteRowRequest) Validate() error {
	return validation.ValidateStruct(o,
		validation.Field(&o.RowIds, validation.Required, validation.Each(validation.Min(1))),
	)
}

func (o *CreateColumnRequest) Validate() error {
	log.Println("CreateColumnRequest.Validate")
	return validation.ValidateStruct(o,
		validation.Field(&o.Columns, validation.Required, validation.Each(validation.By(func(value interface{}) error {
			c, ok := value.(Column)
			if !ok {
				return validation.NewError("400", "invalid column")
			}

			if err := c.Validate(); err != nil {
				return err
			}

			return nil
		}))),
	)
}

func (o *DeleteColumnRequest) Validate() error {
	return validation.ValidateStruct(o,
		validation.Field(&o.ColumnIds, validation.Required, validation.Each(
			validation.NewStringRule(func(value string) bool {
				return value != ""
			}, "invalid column id"),
		)),
	)
}
