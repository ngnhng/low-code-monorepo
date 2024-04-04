package commands

import (
	"github.com/nats-io/nats.go"
	"gitlab.com/shar-workflow/shar/cli/commands/bpmn"
	"gitlab.com/shar-workflow/shar/cli/commands/execution"
	"gitlab.com/shar-workflow/shar/cli/commands/message"
	"gitlab.com/shar-workflow/shar/cli/commands/servicetask"
	"gitlab.com/shar-workflow/shar/cli/commands/usertask"
	"gitlab.com/shar-workflow/shar/cli/commands/workflow"
	"gitlab.com/shar-workflow/shar/cli/flag"
	"gitlab.com/shar-workflow/shar/cli/output"
	"gitlab.com/shar-workflow/shar/common"
	"gitlab.com/shar-workflow/shar/common/logx"
	"log/slog"
	"os"

	"github.com/spf13/cobra"
)

// RootCmd represents the base command when called without any subcommands
var RootCmd = &cobra.Command{
	Use:   "shar",
	Short: "SHAR command line application",
	Long:  ``,
	// Uncomment the following line if your bare application
	// has an action associated with it:
	// Run: func(cmd *cobra.Command, args []string) { },
	PersistentPreRun: func(cmd *cobra.Command, args []string) {

	},
}

// Execute adds all child commands to the root command and sets flag appropriately.
// This is called by main.main(). It only needs to happen once to the RootCmd.
func Execute() {
	err := RootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}

func init() {
	RootCmd.AddCommand(bpmn.Cmd)
	RootCmd.AddCommand(execution.Cmd)
	RootCmd.AddCommand(workflow.Cmd)
	RootCmd.AddCommand(message.Cmd)
	RootCmd.AddCommand(usertask.Cmd)
	RootCmd.AddCommand(servicetask.Cmd)
	RootCmd.PersistentFlags().StringVarP(&flag.Value.Server, flag.Server, flag.ServerShort, nats.DefaultURL, "sets the address of a NATS server")
	RootCmd.PersistentFlags().StringVarP(&flag.Value.LogLevel, flag.LogLevel, flag.LogLevelShort, "error", "sets the logging level for the CLI")
	RootCmd.PersistentFlags().StringVarP(&flag.Value.Namespace, flag.Namespace, flag.NamespaceShort, "default", "sets the SHAR namespace for CLI operations")
	RootCmd.PersistentFlags().BoolVarP(&flag.Value.Json, flag.JsonOutput, flag.JsonOutputShort, false, "sets the CLI output to json")
	var lev slog.Level
	var addSource bool
	switch flag.Value.LogLevel {
	case "debug":
		lev = slog.LevelDebug
		addSource = true
	case "info":
		lev = slog.LevelInfo
	case "warn":
		lev = slog.LevelWarn
	default:
		lev = slog.LevelError
	}
	if flag.Value.Json {
		output.Current = &output.Text{}
	} else {
		output.Current = &output.Json{}
	}
	hndler := common.NewTextHandler(lev, addSource)
	logx.SetDefault("shar-cli", hndler)
}
