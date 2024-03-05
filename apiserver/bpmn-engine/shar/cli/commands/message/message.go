package message

import (
	"github.com/spf13/cobra"
	"gitlab.com/shar-workflow/shar/cli/commands/message/send"
)

// Cmd is the cobra command object
var Cmd = &cobra.Command{
	Use:   "message",
	Short: "Commands for sending workflow messages",
	Long:  ``,
}

func init() {
	Cmd.AddCommand(send.Cmd)
}
