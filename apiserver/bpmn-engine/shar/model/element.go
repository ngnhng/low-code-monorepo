package model

import (
	"fmt"
	"reflect"
)

// Vars is a map of variables. The variables must be primitive go types.
type Vars map[string]any

// Get takes the desired return type as parameter and safely searches the map and returns the value
// if it is found and is of the desired type.
func Get[V any](vars Vars, key string) (V, error) { //nolint:ireturn
	// v is the return type value
	var v V

	if vars[key] == nil {
		return v, fmt.Errorf("workflow var %s found nil", key)
	}

	v, ok := vars[key].(V)
	if !ok {
		return v, fmt.Errorf("workflow var %s found unsupported type for the underlying value", key)
	}

	return v, nil
}

// GetString validates that a key has an underlying value in the map[string]interface{} vars
// and safely returns the result.
func (vars Vars) GetString(key string) (string, error) {
	return Get[string](vars, key)
}

// GetInt validates that a key has an underlying value in the map[int]interface{} vars
// and safely returns the result.
func (vars Vars) GetInt(key string) (int, error) {
	return Get[int](vars, key)
}

// GetInt8 validates that a key has an underlying value in the map[int]interface{} vars
// and safely returns the result.
func (vars Vars) GetInt8(key string) (int8, error) {
	return Get[int8](vars, key)
}

// GetInt16 validates that a key has an underlying value in the map[int]interface{} vars
// and safely returns the result.
func (vars Vars) GetInt16(key string) (int16, error) {
	return Get[int16](vars, key)
}

// GetInt32 validates that a key has an underlying value in the map[int]interface{} vars
// and safely returns the result.
func (vars Vars) GetInt32(key string) (int32, error) {
	return Get[int32](vars, key)
}

// GetInt64 validates that a key has an underlying value in the map[int]interface{} vars
// and safely returns the result.
func (vars Vars) GetInt64(key string) (int64, error) {
	return Get[int64](vars, key)
}

// GetUint8 validates that a key has an underlying value in the map[int]interface{} vars
// and safely returns the result.
func (vars Vars) GetUint8(key string) (uint8, error) {
	return Get[uint8](vars, key)
}

// GetUint16 validates that a key has an underlying value in the map[int]interface{} vars
// and safely returns the result.
func (vars Vars) GetUint16(key string) (uint16, error) {
	return Get[uint16](vars, key)
}

// GetUint32 validates that a key has an underlying value in the map[int]interface{} vars
// and safely returns the result.
func (vars Vars) GetUint32(key string) (uint32, error) {
	return Get[uint32](vars, key)
}

// GetUint64 validates that a key has an underlying value in the map[int]interface{} vars
// and safely returns the result.
func (vars Vars) GetUint64(key string) (uint64, error) {
	return Get[uint64](vars, key)
}

// GetByte validates that a key has an underlying value in the map[int]interface{} vars
// and safely returns the result.
func (vars Vars) GetByte(key string) ([]byte, error) {
	return Get[[]byte](vars, key)
}

// GetBytes validates that a key has an underlying value in the map[int]interface{} vars
// and safely returns the result.
func (vars Vars) GetBytes(key string) ([]byte, error) {
	return Get[[]byte](vars, key)
}

// GetBool validates that a key has an underlying value in the map[int]interface{} vars
// and safely returns the result.
func (vars Vars) GetBool(key string) (bool, error) {
	return Get[bool](vars, key)
}

// GetFloat32 validates that a key has an underlying value in the map[int]interface{} vars
// and safely returns the result.
func (vars Vars) GetFloat32(key string) (float32, error) {
	return Get[float32](vars, key)
}

// GetFloat64 validates that a key has an underlying value in the map[int]interface{} vars
// and safely returns the result.
func (vars Vars) GetFloat64(key string) (float64, error) {
	return Get[float64](vars, key)
}

// Unmarshal unmarshals a SHAR compatible map-portable (map[string]interface{}) var into a struct
func Unmarshal[T any](vars Vars, key string) (*T, error) {
	t := new(T)
	err := fromMap(vars[key].(map[string]interface{}), t)
	if err != nil {
		return nil, err
	}
	return t, nil
}

// Marshal marshals a struct into a SHAR compatible map-portable (map[string]interface{}) var
func Marshal[T any](v *Vars, key string, t *T) error {
	m, err := toMap(t)
	if err != nil {
		return err
	}
	(*v)[key] = m
	return nil
}

// toMap struct to map[string]interface{}
func toMap(in interface{}) (map[string]interface{}, error) {
	out := make(map[string]interface{})
	v := reflect.ValueOf(in)
	if v.Kind() == reflect.Ptr {
		v = v.Elem()
	}
	if v.Kind() != reflect.Struct { // Non-structural return error
		return nil, fmt.Errorf("ToMap only accepts struct or struct pointer; got %T", v)
	}
	t := v.Type()
	for i := 0; i < v.NumField(); i++ {
		fi := t.Field(i)
		out[fi.Name] = v.Field(i).Interface()
	}
	return out, nil
}

// toMap map[string]interface{} to struct
func fromMap(m map[string]interface{}, s interface{}) error {
	stValue := reflect.ValueOf(s).Elem()
	sType := stValue.Type()
	for i := 0; i < sType.NumField(); i++ {
		field := sType.Field(i)
		if value, ok := m[field.Name]; ok {
			stValue.Field(i).Set(reflect.ValueOf(value))
		}
	}
	return nil
}
