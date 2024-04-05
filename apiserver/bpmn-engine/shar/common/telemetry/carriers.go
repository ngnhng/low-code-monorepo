package telemetry

import "github.com/nats-io/nats.go"

// MapCarrier defines an open telemetry carrier that serialises to a go map[string]string
type MapCarrier struct {
	Map map[string]string
}

// Get a map key
func (c *MapCarrier) Get(key string) string {
	return c.Map[key]
}

// Set a map key
func (c *MapCarrier) Set(key string, value string) {
	c.Map[key] = value
}

// Keys - gets all map keys
func (c *MapCarrier) Keys() []string {
	ret := make([]string, 0, len(c.Map))
	for k := range c.Map {
		ret = append(ret, k)
	}
	return ret
}

// NewMapCarrier creates a new instance of MapCarrier
func NewMapCarrier() *MapCarrier {
	return &MapCarrier{
		Map: make(map[string]string),
	}
}

// NatsCarrier defines an open telemetry carrier that serialises to NATS headers
type NatsCarrier struct {
	msg *nats.Msg
}

// Get a header value
func (c *NatsCarrier) Get(key string) string {
	return c.msg.Header.Get(key)
}

// Set a header value
func (c *NatsCarrier) Set(key string, value string) {
	c.msg.Header.Set(key, value)
}

// Keys - returns all header keys
func (c *NatsCarrier) Keys() []string {
	ret := make([]string, 0, len(c.msg.Header))
	for k := range c.msg.Header {
		ret = append(ret, c.msg.Header.Get(k))
	}
	return ret
}

// NewNatsCarrier creates a new instance of NatsCarrier
func NewNatsCarrier(msg *nats.Msg) *NatsCarrier {
	return &NatsCarrier{
		msg: msg,
	}
}
