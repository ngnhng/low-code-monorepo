package usertask

import (
	"github.com/spf13/cobra"
	"gitlab.com/shar-workflow/shar/cli/commands/usertask/list"
)

// Cmd is the cobra command object
var Cmd = &cobra.Command{
	Use:   "usertask",
	Short: "Commands for interacting with user tasks",
	Long:  ``,
}

func init() {
	Cmd.AddCommand(list.Cmd)
}
