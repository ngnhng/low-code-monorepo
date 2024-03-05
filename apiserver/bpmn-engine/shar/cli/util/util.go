package util

import (
	"gitlab.com/shar-workflow/shar/cli/flag"
	"gitlab.com/shar-workflow/shar/client"
)

// GetClient returns a client instance of the SHAR system with the specified namespace.
func GetClient() *client.Client {
	return client.New(client.WithNamespace(flag.Value.Namespace))
}
