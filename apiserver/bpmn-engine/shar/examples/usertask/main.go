package main

import (
	"context"
	"fmt"
	"github.com/nats-io/nats.go"
	"gitlab.com/shar-workflow/shar/client"
	"gitlab.com/shar-workflow/shar/client/taskutil"
	"gitlab.com/shar-workflow/shar/model"
	"os"
	"time"
)

var finished = make(chan struct{})

func main() {
	// Create a starting context
	ctx := context.Background()

	// Dial shar
	cl := client.New()
	if err := cl.Dial(ctx, nats.DefaultURL); err != nil {
		panic(err)
	}

	// Register service tasks
	if err := taskutil.RegisterTaskYamlFile(ctx, cl, "task.Prepare.yaml", prepare); err != nil {
		panic(err)
	}
	if err := taskutil.RegisterTaskYamlFile(ctx, cl, "task.Complete.yaml", complete); err != nil {
		panic(err)
	}

	// Load BPMN workflow
	b, err := os.ReadFile("testdata/usertask.bpmn")
	if err != nil {
		panic(err)
	}
	if _, err := cl.LoadBPMNWorkflowFromBytes(ctx, "UserTaskWorkflowDemo", b); err != nil {
		panic(err)
	}

	// Add a hook to watch for completion
	if err := cl.RegisterProcessComplete("TestUserTasks", processEnd); err != nil {
		panic(err)
	}

	// Launch the workflow
	if _, _, err := cl.LaunchProcess(ctx, "TestUserTasks", model.Vars{"OrderId": 68}); err != nil {
		panic(err)
	}

	// Listen for service tasks
	go func() {
		if err := cl.Listen(ctx); err != nil {
			panic(err)
		}
	}()

	go func() {
		for {
			tsk, err := cl.ListUserTaskIDs(ctx, "andrei")
			if err == nil && tsk.Id != nil {
				if err2 := cl.CompleteUserTask(ctx, "andrei", tsk.Id[0], model.Vars{"Forename": "Brangelina", "Surname": "Miggins"}); err2 != nil {
					panic(err)
				}
				return
			}
			time.Sleep(1 * time.Second)
		}
	}()

	// wait for the workflow to complete
	<-finished
}

// A "Hello World" service task
func prepare(_ context.Context, _ client.JobClient, vars model.Vars) (model.Vars, error) {
	fmt.Println("Preparing")
	oid := vars["OrderId"].(int)
	return model.Vars{"OrderId": oid + 1}, nil
}

// A "Hello World" service task
func complete(_ context.Context, _ client.JobClient, vars model.Vars) (model.Vars, error) {
	fmt.Println("OrderId", vars["OrderId"])
	fmt.Println("Forename", vars["Forename"])
	fmt.Println("Surname", vars["Surname"])
	return model.Vars{}, nil
}

func processEnd(ctx context.Context, vars model.Vars, wfError *model.Error, state model.CancellationState) {
	finished <- struct{}{}
}
