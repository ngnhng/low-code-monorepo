package main

import (
	"context"
	"fmt"
	"github.com/nats-io/nats.go"
	"gitlab.com/shar-workflow/shar/client"
	"gitlab.com/shar-workflow/shar/client/taskutil"
	"gitlab.com/shar-workflow/shar/model"
	"gitlab.com/shar-workflow/shar/server/tools/tracer"
	"os"
)

var finished = make(chan struct{})

func main() {
	// Create a starting context
	ctx := context.Background()

	t := tracer.Trace("127.0.0.1:4222")
	defer t.Close()
	// Dial shar
	cl := client.New(client.WithNamespace("testns"))
	if err := cl.Dial(ctx, nats.DefaultURL); err != nil {
		panic(err)
	}

	// Register the service tasks
	if err := taskutil.RegisterTaskYamlFile(ctx, cl, "./examples/sub-workflow/task.BeforeCallingSubProcess.yaml", beforeCallingSubProcess); err != nil {
		panic(err)
	}
	if err := taskutil.RegisterTaskYamlFile(ctx, cl, "./examples/sub-workflow/task.DuringSubProcess.yaml", duringSubProcess); err != nil {
		panic(err)
	}
	if err := taskutil.RegisterTaskYamlFile(ctx, cl, "./examples/sub-workflow/task.AfterCallingSubProcess.yaml", afterCallingSubProcess); err != nil {
		panic(err)
	}

	// Load the workflows
	w1, _ := os.ReadFile("testdata/sub-workflow-parent.bpmn")
	w2, _ := os.ReadFile("testdata/sub-workflow-child.bpmn")
	if _, err := cl.LoadBPMNWorkflowFromBytes(ctx, "MasterWorkflowDemo", w1); err != nil {
		panic(err)
	}
	if _, err := cl.LoadBPMNWorkflowFromBytes(ctx, "SubWorkflowDemo", w2); err != nil {
		panic(err)
	}

	// Add a hook to watch for completion
	if err := cl.RegisterProcessComplete("WorkflowDemo", processEnd); err != nil {
		panic(err)
	}

	// Launch the workflow
	if _, _, err := cl.LaunchProcess(ctx, "WorkflowDemo", model.Vars{}); err != nil {
		panic(err)
	}
	go func() {
		if err := cl.Listen(ctx); err != nil {
			panic(err)
		}
	}()

	// wait for the workflow to complete
	<-finished
}

func afterCallingSubProcess(_ context.Context, _ client.JobClient, vars model.Vars) (model.Vars, error) {
	fmt.Println(vars["x"])
	return vars, nil
}

func duringSubProcess(_ context.Context, _ client.JobClient, vars model.Vars) (model.Vars, error) {
	z := vars["z"].(int)
	return model.Vars{"z": z + 41}, nil
}

func beforeCallingSubProcess(_ context.Context, _ client.JobClient, _ model.Vars) (model.Vars, error) {
	return model.Vars{"x": 1}, nil
}

func processEnd(ctx context.Context, vars model.Vars, wfError *model.Error, state model.CancellationState) {
	finished <- struct{}{}
}
