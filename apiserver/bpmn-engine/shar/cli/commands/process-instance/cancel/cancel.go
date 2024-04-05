package cancel

import (
	"context"
	"fmt"
	"github.com/spf13/cobra"
	"gitlab.com/shar-workflow/shar/cli/flag"
	"gitlab.com/shar-workflow/shar/cli/output"
	"gitlab.com/shar-workflow/shar/cli/util"
)

// Cmd is the cobra command object
var Cmd = &cobra.Command{
	Use:   "cancel",
	Short: "Cancel a process instance",
	Long:  ``,
	RunE:  run,
	Args:  cobra.MatchAll(cobra.ExactArgs(1), cobra.OnlyValidArgs),
}

func run(cmd *cobra.Command, args []string) error {
	if err := cmd.ValidateArgs(args); err != nil {
		return fmt.Errorf("invalid arguments: %w", err)
	}
	ctx := context.Background()
	processInstanceID := args[0]

	shar := util.GetClient()
	if err := shar.Dial(ctx, flag.Value.Server); err != nil {
		return fmt.Errorf("dialling server: %w", err)
	}
	if err := shar.CancelProcessInstance(ctx, processInstanceID); err != nil {
		return fmt.Errorf("cancel execution: %w", err)
	}
	output.Current.OutputCancelledProcessInstance(processInstanceID)
	return nil
}
