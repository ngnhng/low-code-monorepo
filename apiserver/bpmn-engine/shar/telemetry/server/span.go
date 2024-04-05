package server

import (
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/sdk/instrumentation"
	"go.opentelemetry.io/otel/sdk/resource"
	tracesdk "go.opentelemetry.io/otel/sdk/trace"
	"go.opentelemetry.io/otel/trace"
	"time"
)

type sharSpan struct {
	tracesdk.ReadOnlySpan
	SpanName           string
	SpanCtx            trace.SpanContext
	SpanParent         trace.SpanContext
	Kind               trace.SpanKind
	Start              time.Time
	End                time.Time
	Attrs              []attribute.KeyValue
	SpanLinks          []tracesdk.Link
	SpanEvents         []tracesdk.Event
	SpanStatus         tracesdk.Status
	InstrumentationLib instrumentation.Library
	SpanResource       *resource.Resource
	ChildCount         int
}

// Name returns the name of the span.
func (s *sharSpan) Name() string {
	return s.SpanName
}

// SpanContext returns the unique SpanContext that identifies the span.
func (s *sharSpan) SpanContext() trace.SpanContext {
	return s.SpanCtx
}

// Parent returns the unique SpanContext that identifies the parent of the
// span if one exists. If the span has no parent the returned SpanContext
// will be invalid.
func (s *sharSpan) Parent() trace.SpanContext {
	return s.SpanParent
}

// SpanKind returns the role the span plays in a Trace.
func (s *sharSpan) SpanKind() trace.SpanKind {
	return s.Kind
}

// StartTime returns the time the span started recording.
func (s *sharSpan) StartTime() time.Time {
	return s.Start
}

// EndTime returns the time the span stopped recording. It will be zero if
// the span has not ended.
func (s *sharSpan) EndTime() time.Time {
	return s.End
}

// Attributes returns the defining attributes of the span.
// The order of the returned attributes is not guaranteed to be stable across invocations.
func (s *sharSpan) Attributes() []attribute.KeyValue {
	return s.Attrs
}

// Links returns all the links the span has to other spans.
func (s *sharSpan) Links() []tracesdk.Link {
	return s.SpanLinks
}

// Events returns all the events that occurred within in the spans.
// lifetime.
func (s *sharSpan) Events() []tracesdk.Event {
	return s.SpanEvents
}

// Status returns the spans status.
func (s *sharSpan) Status() tracesdk.Status {
	return s.SpanStatus
}

// InstrumentationLibrary returns information about the instrumentation
// library that created the span.
func (s *sharSpan) InstrumentationLibrary() instrumentation.Library {
	return s.InstrumentationLib
}

// Resource returns information about the entity that produced the span.
func (s *sharSpan) Resource() *resource.Resource {
	return s.SpanResource
}

// DroppedAttributes returns the number of attributes dropped by the span
// due to limits being reached.
func (s *sharSpan) DroppedAttributes() int {
	return 0
}

// DroppedLinks returns the number of links dropped by the span due to
// limits being reached.
func (s *sharSpan) DroppedLinks() int {
	return 0
}

// DroppedEvents returns the number of events dropped by the span due to
// limits being reached.
func (s *sharSpan) DroppedEvents() int {
	return 0
}

// ChildSpanCount returns the count of spans that consider the span a
// direct parent.
func (s *sharSpan) ChildSpanCount() int {
	return s.ChildCount
}

// InstrumentationScope returns information about the instrumentation
// scope that created the span.
func (s *sharSpan) InstrumentationScope() instrumentation.Scope {
	return s.InstrumentationLib
}
