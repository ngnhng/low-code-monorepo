package status

import (
	"context"
	errors2 "errors"
	"fmt"
	"github.com/spf13/cobra"
	"gitlab.com/shar-workflow/shar/cli/flag"
	"gitlab.com/shar-workflow/shar/cli/output"
	"gitlab.com/shar-workflow/shar/cli/util"
	"gitlab.com/shar-workflow/shar/model"
	"gitlab.com/shar-workflow/shar/server/errors"
)

// Cmd is the cobra command object
var Cmd = &cobra.Command{
	Use:   "status",
	Short: "Gets the status of a running execution",
	Long:  ``,
	RunE:  run,
	Args:  cobra.MatchAll(cobra.ExactArgs(1), cobra.OnlyValidArgs),
}

func run(cmd *cobra.Command, args []string) error {
	if err := cmd.ValidateArgs(args); err != nil {
		return fmt.Errorf("invalid arguments: %w", err)
	}
	ctx := context.Background()
	executionID := args[0]
	shar := util.GetClient()
	if err := shar.Dial(ctx, flag.Value.Server); err != nil {
		return fmt.Errorf("dialling server: %w", err)
	}
	status, err := shar.ListExecutionProcesses(ctx, executionID)
	if err != nil {
		return fmt.Errorf("getting execution status: %w", err)
	}
	states := make(map[string][]*model.WorkflowState)
	for _, i := range status.ProcessInstanceId {
		res, err := shar.GetProcessInstanceStatus(ctx, i)
		if errors2.Is(err, errors.ErrProcessInstanceNotFound) {
			continue
		}
		states[i] = res.ProcessState
	}
	output.Current.OutputExecutionStatus(executionID, states)
	return nil
}
