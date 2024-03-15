> The source code is organized in a clean architecture pattern. The main idea is to separate the business logic from the infrastructure and the framework. This way, the business logic is not tied to a specific framework or library, making it easier to change the framework or library in the future.

The project main layers includes:

- **Router**: This layer is responsible for receiving the HTTP requests and sending them to the controller. It is also responsible for sending the response back to the client.

- **Controller**: This layer is responsible for receiving the HTTP requests from the router and orchestrating the calling of use-case functions. It is also responsible for sending the response back to the router.

- **Use-case**: This layer is responsible for receiving the requests from the controller, executing the business logic and sending the response back to the controller.

- **Domain**: This layer is responsible for the business logic. It contains the entities, the value objects.

- Other external layers: These layers are responsible for the infrastructure and the framework. They contains the database, the HTTP server, the email server, etc.

```                                                                 
 +-----------------+      +-------------------+      +-------------------+
 |                 |      |                   |      |                   |
 |      Router     |----->|    Controller     |----->|    Use-case       |
 |                 |      |                   |      |                   |
 +-----------------+      +-------------------+      +-------------------+
                                                               ^          
                                                               |          
                                                     +-------------------+
                                                     |                   |
                                                     |     Domain        |
                                                     |                   |
                                                     +-------------------+
```

## Example
```go
package main

import (
	"context"
	"fmt"

	"github.com/nats-io/nats.go"
	"gitlab.com/shar-workflow/shar/client"
	"gitlab.com/shar-workflow/shar/client/taskutil"
	"gitlab.com/shar-workflow/shar/model"

	"os"
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

	// Load BPMN workflow
	b, err := os.ReadFile("testdata/message-workflow.bpmn")
	if err != nil {
		panic(err)
	}

	if err := taskutil.RegisterTaskYamlFile(ctx, cl, "testdata/task.step1.yaml", step1); err != nil {
		panic(err)
	}

	if err := taskutil.RegisterTaskYamlFile(ctx, cl, "testdata/task.step2.yaml", step2); err != nil {
		panic(err)
	}

	if _, err := cl.LoadBPMNWorkflowFromBytes(ctx, "MessageDemo", b); err != nil {
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
	if _, _, err = cl.LaunchProcess(
		ctx,
		"Process_03llwnm",
		model.Vars{"orderId": 57, "carried": "payload"},
	); err != nil {
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

// A "Hello World" service task
func simpleProcess(_ context.Context, _ client.JobClient, _ model.Vars) (model.Vars, error) {
	fmt.Println("Hello World")
	return model.Vars{}, nil
}

func step1(_ context.Context, _ client.JobClient, v model.Vars) (model.Vars, error) {
	fmt.Println("Step 1")
	fmt.Printf("Carried: %v\n", v["carried"])
	//fmt.Printf("Carried: %v\n", v["carried2"])
	fmt.Printf("OrderId: %v\n", v["orderId"])
	fmt.Printf("Carried: %v\n", v["step1Carried"])

	return model.Vars{}, nil
}

func step2(_ context.Context, _ client.JobClient, v model.Vars) (model.Vars, error) {
	fmt.Println("Step 2")
	fmt.Printf("Carried: %v\n", v["carried"])
	fmt.Printf("OrderId: %v\n", v["orderId"])
	return model.Vars{}, nil
}

func sendMessage(ctx context.Context, cmd client.MessageClient, vars model.Vars) error {
	fmt.Println("Sending Message...")
	return cmd.SendMessage(ctx, "continueMessage", 57, vars)
}

func processEnd(ctx context.Context, vars model.Vars, wfError *model.Error, state model.CancellationState) {
	finished <- struct{}{}
}

```