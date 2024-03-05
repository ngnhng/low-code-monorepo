package commands

import (
	"gitlab.com/shar-workflow/shar/common"
	"gitlab.com/shar-workflow/shar/common/logx"
	"gitlab.com/shar-workflow/shar/zen-shar/flag"
	"gitlab.com/shar-workflow/shar/zen-shar/server"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"github.com/spf13/cobra"
)

var sig = make(chan os.Signal, 1)

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:   "zen-shar",
	Short: "ZEN SHAR development server",
	Long:  ``,
	// Uncomment the following line if your bare application
	// has an action associated with it:
	// Run: func(cmd *cobra.Command, args []string) { },
	RunE: run,
}

func run(cmd *cobra.Command, args []string) error {
	// Capture SIGTERM and SIGINT
	signal.Notify(sig, syscall.SIGTERM, syscall.SIGINT)

	opts := make([]server.ZenSharOptionApplyFn, 0)
	if flag.Value.Server != "" {
		opts = append(opts, server.WithNatsServerAddress(flag.Value.Server))
	}
	setupLogging()
	ss, _, err := server.GetServers(flag.Value.Concurrency, nil, nil, opts...)

	if err != nil {
		panic(err)
	}

	<-sig
	ss.Shutdown()
	return nil
}

// Execute adds all child commands to the root command and sets flag appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	err := rootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}

func init() {
	rootCmd.PersistentFlags().StringVarP(&flag.Value.Server, flag.Server, flag.ServerShort, "", "sets the address of a NATS server")
	rootCmd.PersistentFlags().StringVarP(&flag.Value.LogLevel, flag.LogLevel, flag.LogLevelShort, "info", "sets the logging level")
	rootCmd.PersistentFlags().IntVarP(&flag.Value.Concurrency, flag.Concurrency, flag.ConcurrencyShort, 10, "sets the concurrent level of the shar listeners")
}

func setupLogging() {
	var lev slog.Level
	var addSource bool
	switch flag.Value.LogLevel {
	case "debug":
		lev = slog.LevelDebug
		addSource = true
	case "warn":
		lev = slog.LevelWarn
	case "error":
		lev = slog.LevelError
	default:
		lev = slog.LevelInfo
	}
	hndler := common.NewTextHandler(lev, addSource)
	logx.SetDefault("zen-shar", hndler)
}
