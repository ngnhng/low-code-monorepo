![Simple Hyperscale Activity Router](/shar.png?raw=true "SHAR")

## What is SHAR?
SHAR is a workflow engine powered by message queue.  It is capable of loading and executing BPMN workflow XML. 
It aims to be small, and simple and have a tiny footprint.

To accomplish massive scalability, the workflow transition, and activity calls are sent as immutable messages encapsulating their state.
SHAR uses a nats.io backend by default to facilitate redundancy and high throughput whilst still being able to run on low power hardware.

SHAR is 100% written in go, so takes advantage of the speed and size of a native executable.

## Why is SHAR?
Most BPMN engines are heavyweight and rely on proprietary storage and retry logic.
SHAR concentrates on being a workflow engine and lets reliable message queuing do the heavy lifting.

The developers of BPMN engines put a lot of work into making the persistence, scalability, resilience and retry logic for their products.
Messaging platforms such as nats.io have already tackled these challenges, and their dedicated solutions are usually more performant.

There is a tendency to write the engines in Java, which in turn requires a JVM to run.
Many give Go developers a native client to run workflows, but the engines remain a black box only extensible through Java.


## How do I use SHAR?
SHAR currently supports [some of the functionality](docs/functionality.md) from the (Camunda Platform 8) files generated by [Camunda Modeler](https://camunda.com/download/modeler/).

NB:  Camunda modeler allows message names and service task definition types to be defined as expressions.
Due to the way that SHAR preloads its queues, these are interpreted as fixed string values (unquoted).

In the future we hope to provide a dedicated modeler just for SHAR workflows. 


The following example assumes you have started the SHAR server. A [docker compose file](deploy/compose/docker-compose.yml) is provided to make this simple.

## Prerequesits
Install the packages to build and run the SHAR-server, SHAR-telemetry or examples on this box :-

golang
make
protobuf-compiler
protoc-gen-go
docker (optional)
docker-compose (optional)

## Building

to build use :-

make configure
make

# Running from cmdline
You then need to start the shar-server and the shar-telemetry

build/telemetry/shar-telemetry &
build/server/shar 

# Running as a docker image
I suggest to use the docker loopback address host.docker.internal to reach NATS running on the same docker node/swarm, the localhost address 127.0.0.1 (default) will be local to the container so fails. If the address doesn't resolve, it will be something like 172.17.0.1 or 172.18.0.1. 

make docker
docker run -d -e NATS_URL=nats://host.docker.internal:4222 shar
docker run -d -e JAEGER_URL=http://host.docker.internal:14268/api/traces -e NATS_URL=nats://host.docker.internal:4222 shar-telemetry


# Build CLI tool

cd cli/cmd/shar
go build

# Using CLI tool
You can view the workflows already registered, and check connectivity.

cli/cmd/shar/shar --help

# Run an example workflow 

go run examples/sub-workflow/main.go

```go
package main

import (
	"context"
	"fmt"
	"github.com/nats-io/nats.go"
	"gitlab.com/shar-workflow/shar/client"
	"gitlab.com/shar-workflow/shar/model"
	"os"
)

func main() {
	// Create a starting context
	ctx := context.Background()

	cl := client.New()
	if err := cl.Dial(ctx,nats.DefaultURL); err != nil {
		panic(err)
	}

	// Load BPMN workflow
	b, err := os.ReadFile("testdata/simple-workflow.bpmn")
	if err != nil {
		panic(err)
	}
	if _, err := cl.LoadBPMNWorkflowFromBytes(ctx, "SimpleWorkflowDemo", b); err != nil {
		panic(err)
	}

	// Register a service task
	err = cl.RegisterServiceTask(ctx, "SimpleProcess", simpleProcess)
	if err != nil {
		panic(err)
	}
	// A hook to watch for completion
	complete := make(chan *model.WorkflowInstanceComplete, 100)
	cl.RegisterWorkflowInstanceComplete(complete)

	// Launch the workflow
	wfiID, err := cl.LaunchWorkflow(ctx, "SimpleWorkflowDemo", model.Vars{})
	if err != nil {
		panic(err)
	}

	// Listen for service tasks
	go func() {
		err := cl.Listen(ctx)
		if err != nil {
			panic(err)
		}
	}()

	// wait for the workflow to complete
	for i := range complete {
		if i.WorkflowInstanceId == wfiID {
			break
		}
	}
}

// A "Hello World" service task
func simpleProcess(_ context.Context, _ client.JobClient, _ model.Vars) (model.Vars, error) {
	fmt.Println("Hello World")
	return model.Vars{}, nil
}
```