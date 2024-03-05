package commands

import (
	"github.com/nats-io/nats.go"
	"github.com/spf13/cobra"
	"gitlab.com/shar-workflow/shar/common"
	"gitlab.com/shar-workflow/shar/common/logx"
	show_nats_config "gitlab.com/shar-workflow/shar/server/commands/show-nats-config"
	"gitlab.com/shar-workflow/shar/server/config"
	"gitlab.com/shar-workflow/shar/server/flags"
	"gitlab.com/shar-workflow/shar/server/server"
	"log"
	"log/slog"
	"os"
	"strings"
)

// RootCmd represents the base command when called without any subcommands
var RootCmd = &cobra.Command{
	Use:   "shar",
	Short: "SHAR Server",
	Long:  ``,
	// Uncomment the following line if your bare application
	// has an action associated with it:
	Run: func(cmd *cobra.Command, args []string) {
		cfg, err := config.GetEnvironment()
		if err != nil {
			log.Fatal(err)
		}
		var lev slog.Level
		var addSource bool
		switch cfg.LogLevel {
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

		conn, err := nats.Connect(cfg.NatsURL)
		if err != nil {
			slog.Error("connect to NATS", err, slog.String("url", cfg.NatsURL))
			panic(err)
		}

		handlerFactoryFns := map[string](func() slog.Handler){
			"text": func() slog.Handler {
				return common.NewTextHandler(lev, addSource)
			},
			"shar-handler": func() slog.Handler {
				return common.NewSharHandler(common.HandlerOptions{Level: lev}, &common.NatsLogPublisher{Conn: conn})
			},
		}

		cfgHandlers := strings.Split(cfg.LogHandler, ",")
		handlers := []slog.Handler{}
		for _, h := range cfgHandlers {
			handlers = append(handlers, handlerFactoryFns[h]())
		}

		logx.SetDefault("shar", common.NewMultiHandler(handlers))

		if err != nil {
			panic(err)
		}
		svr := server.New(server.Concurrency(cfg.Concurrency), server.NatsConn(conn), server.NatsUrl(cfg.NatsURL), server.GrpcPort(cfg.Port))
		svr.Listen()
	},
	PersistentPreRun: func(cmd *cobra.Command, args []string) {

	},
}

// Execute adds all child commands to the root command and sets flag appropriately.
// This is called by main.main(). It only needs to happen once to the RootCmd.
func Execute() {
	RootCmd.AddCommand(show_nats_config.RootCmd)
	RootCmd.Flags().StringVar(&flags.Value.NatsConfig, flags.NatsConfig, "", "provides a path to a nats configuration file.  The current config file can be obtained using 'show-nats-config'")
	err := RootCmd.Execute()

	if err != nil {
		os.Exit(1)
	}
}

func init() {
	/*
		RootCmd.AddCommand(bpmn.Cmd)
		RootCmd.AddCommand(execution.Cmd)
		RootCmd.AddCommand(workflow.Cmd)
		RootCmd.AddCommand(message.Cmd)
		RootCmd.AddCommand(usertask.Cmd)
		RootCmd.AddCommand(servicetask.Cmd)
		RootCmd.PersistentFlags().StringVarP(&flag.Value.Server, flag.Server, flag.ServerShort, nats.DefaultURL, "sets the address of a NATS server")
		RootCmd.PersistentFlags().StringVarP(&flag.Value.LogLevel, flag.LogLevel, flag.LogLevelShort, "error", "sets the logging level for the CLI")
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
		logx.SetDefault(lev, addSource, "shar-cli")

	*/
}
