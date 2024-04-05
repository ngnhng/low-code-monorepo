package message

import (
	"github.com/spf13/cobra"
	"gitlab.com/shar-workflow/shar/cli/commands/process-instance/cancel"
)

// Cmd is the cobra command object
var Cmd = &cobra.Command{
	Use:   "process-instance",
	Short: "Commands for manipulating process instances",
	Long:  ``,
}

func init() {
	Cmd.AddCommand(cancel.Cmd)
}
