package servicetask

import (
	"github.com/spf13/cobra"
	"gitlab.com/shar-workflow/shar/cli/commands/servicetask/list"
)

// Cmd is the cobra command object
var Cmd = &cobra.Command{
	Use:   "servicetask",
	Short: "Commands for interacting with service tasks",
	Long:  ``,
}

func init() {
	Cmd.AddCommand(list.Cmd)
}
