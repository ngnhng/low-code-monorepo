package data

import "github.com/nats-io/nats.go"

// WithEphemeralStorage specifies a client store the result of all operations in memory.
func WithEphemeralStorage() ephemeralStorage { //nolint
	return ephemeralStorage{}
}

type ephemeralStorage struct{}

func (o ephemeralStorage) configure(client *Client) {
	client.storageType = nats.MemoryStorage
}

// WithConcurrency specifies the number of threads to process each service task.
func WithConcurrency(n int) concurrency { //nolint
	return concurrency{val: n}
}

type concurrency struct {
	val int
}

func (o concurrency) configure(client *Client) {
	client.concurrency = o.val
}
