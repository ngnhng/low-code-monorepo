package commands

import (
	"context"
	"fmt"
	"github.com/nats-io/nats.go"
	"github.com/spf13/cobra"
	"gitlab.com/shar-workflow/shar/common"
	"gitlab.com/shar-workflow/shar/common/logx"
	"gitlab.com/shar-workflow/shar/server/messages"
	"gitlab.com/shar-workflow/shar/server/services/storage"
	show_nats_config "gitlab.com/shar-workflow/shar/telemetry/commands/show-nats-config"
	"gitlab.com/shar-workflow/shar/telemetry/config"
	"gitlab.com/shar-workflow/shar/telemetry/flags"
	"gitlab.com/shar-workflow/shar/telemetry/server"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
)

// RootCmd represents the base command when called without any subcommands
var RootCmd = &cobra.Command{
	Use:   "shar-telemetry",
	Short: "SHAR Telemetry Server",
	Long:  ``,
	Run: func(cmd *cobra.Command, args []string) {

		// Get the configuration
		cfg, err := config.GetEnvironment()
		if err != nil {
			panic(err)
		}

		if flags.Value.NatsConfig != "" {
			b, err := os.ReadFile(flags.Value.NatsConfig)
			if err != nil {
				slog.Error("read nats configuration file", slog.String("error", err.Error()))
				os.Exit(1)
			}
			storage.NatsConfig = string(b)
		}

		// Connect to nats
		nc, err := nats.Connect(cfg.NatsURL)
		if err != nil {
			panic(err)
		}

		// Get JetStream
		js, err := nc.JetStream()
		if err != nil {
			panic(err)
		}

		if len(os.Args) > 1 && os.Args[1] == "--remove" {
			// Attempt both in case one failed last time, and deal with errors after
			err1 := js.DeleteConsumer("WORKFLOW_TELEMETRY", "Tracing")
			err2 := js.DeleteKeyValue(messages.KvTracking)
			if err1 != nil {
				panic(err1)
			}
			if err2 != nil {
				panic(err2)
			}
			return
		}

		ctx := context.Background()

		mp, err := server.SetupMetrics(ctx, cfg, "shar-telemetry-processor")
		if err != nil {
			slog.Error("failed to init metrics", "err", err.Error())
		}
		defer func() {
			err := mp.Shutdown(ctx)
			if err != nil {
				slog.Error("failed to shutdown metrics provider", "err", err.Error())
			}
		}()

		exp, err := exporterFor(ctx, cfg)
		if err != nil {
			panic(err)
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

		logx.SetDefault("shar", common.NewTextHandler(lev, addSource))

		// Start the server
		svr := server.New(ctx, nc, js, nats.FileStorage, exp)
		if err := svr.Listen(); err != nil {
			panic(err)
		}

		slog.Warn("STARTED TELEMETRY")

		// Capture SIGTERM and SIGINT
		sigChan := make(chan os.Signal, 3)
		signal.Notify(sigChan, syscall.SIGTERM, syscall.SIGINT)
		<-sigChan
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

// nolint:ireturn
func exporterFor(ctx context.Context, cfg *config.Settings) (server.Exporter, error) {
	opts := []otlptracehttp.Option{otlptracehttp.WithEndpoint(cfg.OTLPEndpoint)}
	if !cfg.OTLPEndpointIsSecure {
		opts = append(opts, otlptracehttp.WithInsecure())
	}
	exporter, err := otlptracehttp.New(ctx, opts...)
	if err != nil {
		return nil, fmt.Errorf("error constructing oltp exporter: %w", err)
	}
	return exporter, nil
}
