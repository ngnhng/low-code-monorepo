package bpmn

import (
	"github.com/spf13/cobra"
	"gitlab.com/shar-workflow/shar/cli/commands/bpmn/load"
)

// Cmd is the cobra command object
var Cmd = &cobra.Command{
	Use:   "bpmn",
	Short: "Actions for manipulating bpmn",
	Long:  ``,
}

func init() {
	Cmd.AddCommand(load.Cmd)
}
