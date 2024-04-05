package execution

import (
	"github.com/spf13/cobra"
	"gitlab.com/shar-workflow/shar/cli/commands/execution/list"
	"gitlab.com/shar-workflow/shar/cli/commands/execution/status"
	"gitlab.com/shar-workflow/shar/cli/commands/process-instance/cancel"
)

// Cmd is the cobra command object
var Cmd = &cobra.Command{
	Use:   "execution",
	Short: "Commands for dealing with executions",
	Long:  ``,
}

func init() {
	Cmd.AddCommand(list.Cmd)
	Cmd.AddCommand(status.Cmd)
	Cmd.AddCommand(cancel.Cmd)
}
