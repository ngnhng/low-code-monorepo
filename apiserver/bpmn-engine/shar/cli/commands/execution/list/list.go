package list

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
	Use:   "list",
	Short: "List running execution",
	Long:  ``,
	RunE:  run,
	Args:  cobra.MatchAll(cobra.ExactArgs(1), cobra.OnlyValidArgs),
}

func run(cmd *cobra.Command, args []string) error {
	if err := cmd.ValidateArgs(args); err != nil {
		return fmt.Errorf("invalid arguments: %w", err)
	}
	ctx := context.Background()
	wfName := args[0]
	shar := util.GetClient()
	if err := shar.Dial(ctx, flag.Value.Server); err != nil {
		return fmt.Errorf("dialling server: %w", err)
	}
	res, err := shar.ListExecution(ctx, wfName)
	if err != nil {
		return fmt.Errorf("list executions: %w", err)
	}
	output.Current.OutputListExecution(res)
	return nil
}
