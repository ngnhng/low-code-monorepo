package workflow

import (
	"github.com/spf13/cobra"
	"gitlab.com/shar-workflow/shar/cli/commands/workflow/list"
	"gitlab.com/shar-workflow/shar/cli/commands/workflow/start"
)

// Cmd is the cobra command object
var Cmd = &cobra.Command{
	Use:   "workflow",
	Short: "Commands for dealing with workflows",
	Long:  ``,
}

func init() {
	Cmd.AddCommand(start.Cmd)
	Cmd.AddCommand(list.Cmd)
}
