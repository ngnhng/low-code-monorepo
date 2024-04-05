package main

import (
	"fmt"
	"github.com/nats-io/nats.go"
	"gitlab.com/shar-workflow/shar/server/messages"
	"os"
)

func main() {
	var natsURI string
	if len(os.Args) < 2 {
		natsURI = "nats://127.0.0.1:4222"
	} else {
		natsURI = os.Args[1]
	}
	con, err := nats.Connect(natsURI)
	if err != nil {
		panic(err)
	}
	js, err := con.JetStream()
	if err != nil {
		panic(err)
	}

	if err := js.DeleteStream("WORKFLOW"); err != nil {
		fmt.Printf("*Not Deleted Stream WORKFLOW: %s\n", err.Error())
	} else {
		fmt.Printf("Deleted stream WORKFLOW\n")
	}
	kvDelete(js,
		messages.KvUserTask,
		messages.KvInstance,
		messages.KvDefinition,
		messages.KvJob,
		messages.KvTracking,
		messages.KvVersion,
	)

}

func kvDelete(js nats.JetStreamContext, buckets ...string) {
	for _, v := range buckets {
		if err := js.DeleteKeyValue(v); err != nil {
			fmt.Printf("*Not Deleted %s: %s\n", v, err.Error())
		} else {
			fmt.Printf("Deleted %s\n", v)
		}
	}
}
