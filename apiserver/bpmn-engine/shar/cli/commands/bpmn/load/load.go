package load

import (
	"context"
	"fmt"
	"github.com/spf13/cobra"
	"gitlab.com/shar-workflow/shar/cli/flag"
	"gitlab.com/shar-workflow/shar/cli/output"
	"gitlab.com/shar-workflow/shar/cli/util"
	"os"
)

// Cmd is the cobra command object
var Cmd = &cobra.Command{
	Use:   "load",
	Short: "Loads a BPMN XML file into shar",
	Long: `shar bpmn load "WorkflowName" ./path-to-workflow.bpmn 
	`,
	RunE: run,
	Args: cobra.MatchAll(cobra.ExactArgs(2), cobra.OnlyValidArgs),
}

func run(cmd *cobra.Command, args []string) error {
	if err := cmd.ValidateArgs(args); err != nil {
		return fmt.Errorf("invalid arguments: %w", err)
	}
	ctx := context.Background()
	b, err := os.ReadFile(args[1])
	if err != nil {
		return fmt.Errorf("reading file: %w", err)
	}

	shar := util.GetClient()
	if err := shar.Dial(ctx, flag.Value.Server); err != nil {
		return fmt.Errorf("dialling server: %w", err)
	}
	wn, err := shar.LoadBPMNWorkflowFromBytes(ctx, args[0], b)
	if err != nil {
		return fmt.Errorf("workflow could not be loaded: %w", err)
	}
	output.Current.OutputLoadResult(wn)
	return nil
}
