package flags

const (
	// NatsConfig is the flag name for passing the path to a nats configuration file.
	NatsConfig = "nats-config"
)

// Set is the set of flags associated with the CLI.
type Set struct {
	NatsConfig string
}

// Value contains the values of the SHAR CLI flags.
var Value Set
