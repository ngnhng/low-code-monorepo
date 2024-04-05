package show_nats_config

import (
	"fmt"
	"github.com/spf13/cobra"
	"gitlab.com/shar-workflow/shar/server/services/storage"
)

// RootCmd represents the base command when called without any subcommands
var RootCmd = &cobra.Command{
	Use:   "show-nats-config",
	Short: "Displays the default NATS server configuration",
	Long:  ``,
	// Uncomment the following line if your bare application
	// has an action associated with it:
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println(storage.NatsConfig)
	},
	PersistentPreRun: func(cmd *cobra.Command, args []string) {

	},
}
