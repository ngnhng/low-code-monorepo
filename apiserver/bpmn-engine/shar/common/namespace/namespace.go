package namespace

import (
	"fmt"
)

// Default this is the default namespace name
const Default = "default"

// PrefixWith puts the namespace as a prefix to the given kvName
func PrefixWith(namespace string, name string) string {
	return fmt.Sprintf("%s_%s", namespace, name)
}
