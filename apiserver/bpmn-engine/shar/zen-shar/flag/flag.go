package flag

const (
	Server           = "server"   // Server is the name of the server flag.
	LogLevel         = "loglevel" // LogLevel is the name of the log level flag.
	ServerShort      = "s"        // ServerShort is the short name of the server flag.
	LogLevelShort    = "l"        // LogLevelShort is the short name of the log level flag.
	Concurrency      = "parallel" // Concurrency is the name of the concurrency flag.
	ConcurrencyShort = "p"        // ConcurrencyShort is the short name of the concurrency flag.
)

// Set is a container for all of the flag messages used by zen-shar
type Set struct {
	Server         string   // Server - the NATS server URL setting
	LogLevel       string   // LogLevel - the Log level setting
	CorrelationKey string   // CorrelationKey - the correlation key setting.
	DebugTrace     bool     // DebugTrace - the debug trace enabled setting.
	Vars           []string // Vars - the workflow variables setting.
	Concurrency    int      // Concurrency - the number of concurrent threads processing each message type.
}

var Value Set // Value contains the runtime values for flags
