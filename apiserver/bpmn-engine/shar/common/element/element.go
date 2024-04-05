package element

const (
	CallActivity                  = "callActivity"                  // CallActivity - the name of the sub process launch element type.
	EndEvent                      = "endEvent"                      // EndEvent - the name of the process end event element type.
	Gateway                       = "Gateway"                       // Gateway - the name of the decision or merge element type.
	LinkIntermediateCatchEvent    = "intermediateLinkCatchEvent"    // LinkIntermediateCatchEvent - the name of the link receiver element type.
	LinkIntermediateThrowEvent    = "intermediateLinkThrowEvent"    // LinkIntermediateThrowEvent - the name of the link sender element type.
	ManualTask                    = "manualTask"                    // ManualTask - the name of the manual task element type.
	MessageIntermediateCatchEvent = "messageIntermediateCatchEvent" // MessageIntermediateCatchEvent - the name of the message receiver element type.
	MessageIntermediateThrowEvent = "intermediateMessageThrowEvent" // MessageIntermediateThrowEvent - the name of the message sender element type.
	ServiceTask                   = "serviceTask"                   // ServiceTask - the name of the service task element type.
	StartEvent                    = "startEvent"                    // StartEvent - the name of the start event element type.
	TimedStartEvent               = "timedStartEvent"               // TimedStartEvent - the name of the time triggered start event type.
	TimerIntermediateCatchEvent   = "timerIntermediateCatchEvent"   // TimerIntermediateCatchEvent - the name of the timer triggered element type.
	UserTask                      = "userTask"                      // UserTask - the name of the user task element type.
)
