package list

import (
	"context"
	"fmt"
	"github.com/spf13/cobra"
	"gitlab.com/shar-workflow/shar/cli/flag"
	"gitlab.com/shar-workflow/shar/cli/util"
)

// Cmd is the cobra command object
var Cmd = &cobra.Command{
	Use:   "list",
	Short: "Lists service tasks",
	Long:  ``,
	RunE:  run,
	Args:  cobra.MatchAll(cobra.NoArgs),
}

func run(cmd *cobra.Command, args []string) error {
	if err := cmd.ValidateArgs(args); err != nil {
		return fmt.Errorf("invalid arguments: %w", err)
	}
	ctx := context.Background()
	shar := util.GetClient()
	if err := shar.Dial(ctx, flag.Value.Server); err != nil {
		return fmt.Errorf("dialling server: %w", err)
	}
	res, err := shar.ListTaskSpecs(ctx, false)
	if err != nil {
		return fmt.Errorf("send message failed: %w", err)
	}
	fmt.Println(res)
	//output.Current.OutputServiceTasks(res)
	return nil
}

func init() {
	Cmd.Flags().StringVarP(&flag.Value.CorrelationKey, flag.CorrelationKey, flag.CorrelationKeyShort, "", "a correlation key for the message")
}
