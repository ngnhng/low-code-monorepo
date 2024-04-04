package main

import (
	"context"
	"fmt"
	"github.com/nats-io/nats.go"
	"gitlab.com/shar-workflow/shar/client"
	"gitlab.com/shar-workflow/shar/client/taskutil"
	"gitlab.com/shar-workflow/shar/model"
	zensvr "gitlab.com/shar-workflow/shar/zen-shar/server"
	"os"
)

var finished = make(chan struct{})

func main() {
	ss, ns, err := zensvr.GetServers(8, nil, nil)
	defer ss.Shutdown()
	defer ns.Shutdown()
	// Create a starting context
	ctx := context.Background()

	// Dial shar
	cl := client.New()
	if err := cl.Dial(ctx, nats.DefaultURL); err != nil {
		panic(err)
	}

	// Load BPMN workflow
	b, err := os.ReadFile("testdata/message-workflow.bpmn")
	if err != nil {
		panic(err)
	}
	if _, err := cl.LoadBPMNWorkflowFromBytes(ctx, "MessageDemo", b); err != nil {
		panic(err)
	}

	// Register a service task
	if err := taskutil.RegisterTaskYamlFile(ctx, cl, "./examples/messaging/task.step1.yaml", step1); err != nil {
		panic(err)
	}
	if err := taskutil.RegisterTaskYamlFile(ctx, cl, "./examples/messaging/task.step2.yaml", step2); err != nil {
		panic(err)
	}
	if err := cl.RegisterMessageSender(ctx, "MessageDemo", "continueMessage", sendMessage); err != nil {
		panic(err)
	}
	// A hook to watch for completion
	if err := cl.RegisterProcessComplete("Process_03llwnm", processEnd); err != nil {
		panic(err)
	}

	// Launch the workflow
	if _, _, err = cl.LaunchProcess(ctx, "Process_03llwnm", model.Vars{"orderId": 57, "carried": "payload"}); err != nil {
		panic(err)
	}

	// Listen for service tasks
	go func() {
		if err := cl.Listen(ctx); err != nil {
			panic(err)
		}
	}()

	// wait for the workflow to complete
	<-finished
}

func step1(_ context.Context, _ client.JobClient, _ model.Vars) (model.Vars, error) {
	fmt.Println("Step 1")
	return model.Vars{}, nil
}

func step2(_ context.Context, _ client.JobClient, _ model.Vars) (model.Vars, error) {
	fmt.Println("Step 2")
	return model.Vars{}, nil
}

func sendMessage(ctx context.Context, cmd client.MessageClient, vars model.Vars) error {
	fmt.Println("Sending Message...")
	return cmd.SendMessage(ctx, "continueMessage", 57, model.Vars{"carried": vars["carried"]})
}

func processEnd(ctx context.Context, vars model.Vars, wfError *model.Error, state model.CancellationState) {
	fmt.Println(vars)
	finished <- struct{}{}
}
