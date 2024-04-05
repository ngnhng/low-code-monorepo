package telemetry

import (
	"testing"
)

/*
	These tests hope to cover the following scenarios:
	1. The client has open telemetry, the SHAR server does not, and the telemetry server expects spans.
		In this scenario the client passes telemetry using the nats message serializer.
		SHAR server converts that to a set of context values to pass round.
		Emitted states contain the telemetry values.
	2. The client has open telemetry, the SHAR server has too, and the telemetry server expects spans.
		In this scenario the client passes telemetry using the nats message serializer.
		SHAR server converts that using the open telemetry context serializer, and adds its own spans.
		Emitted states contain the telemetry values for the SHAR parent spans, but the telemetry server
        should use the ID of the WorkflowState.

	Either way, the client should receive its telemetry parameters back when a service task is called.
*/

func TestClientTelemetryToSharServerTelemetry(t *testing.T) {
	testClientToSharServerWithTelemetry(t, true, true)
}

func TestClientNoTelemetryToSharServerTelemetry(t *testing.T) {
	testClientToSharServerWithTelemetry(t, false, true)
}

func TestClientTelemetryToSharServeWithNewTraceIdrNoTelemetry(t *testing.T) {
	testClientToSharServerWithTelemetry(t, true, false)
}

func TestClientNoTelemetryToSharServerNoTelemetry(t *testing.T) {
	testClientToSharServerWithTelemetry(t, false, false)
}

// testClientToSharServerWithTelemetry emulates communication with telemetry across the platform;
// Initially, the mock client calls the server using middleware with a NATS message optionally loaded with telemetry
// The mock server extracts the client telemetry payload using the API middleware, and attaches it to a WorkflowState proto.
// The mock telemetry server receives the message, and checks it.
// Finally, a mock service task host receives the telemetry an optionally uses it for its call context.
func testClientToSharServerWithTelemetry(t *testing.T, clientEnabled bool, serverEnabled bool) {
}
