package list

import (
	"context"
	"fmt"
	"github.com/spf13/cobra"
	"gitlab.com/shar-workflow/shar/cli/flag"
	"gitlab.com/shar-workflow/shar/cli/output"
	"gitlab.com/shar-workflow/shar/cli/util"
	"gitlab.com/shar-workflow/shar/model"
)

// Cmd is the cobra command object
var Cmd = &cobra.Command{
	Use:   "list",
	Short: "Lists user tasks",
	Long:  ``,
	RunE:  run,
	Args:  cobra.MatchAll(cobra.ExactArgs(1), cobra.OnlyValidArgs),
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
	ut, err := shar.ListUserTaskIDs(ctx, args[0])
	if err != nil {
		return fmt.Errorf("send message failed: %w", err)
	}
	res := make([]*model.GetUserTaskResponse, len(ut.Id))
	for i, v := range ut.Id {
		ut, _, err := shar.GetUserTask(ctx, args[0], v)
		if err != nil {
			return fmt.Errorf("get user task %s: %w", v, err)
		}
		res[i] = ut
	}
	output.Current.OutputUserTaskIDs(res)
	return nil
}

func init() {
	Cmd.Flags().StringVarP(&flag.Value.CorrelationKey, flag.CorrelationKey, flag.CorrelationKeyShort, "", "a correlation key for the message")
}
