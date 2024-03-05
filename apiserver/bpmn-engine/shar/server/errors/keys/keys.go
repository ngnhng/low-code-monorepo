package keys

// ContextKey is the wrapper for using context keys
type ContextKey string

const (
	// ElementName is the key of the currently executing workflow element.
	ElementName = "el.name"
	// ElementID is the key for the workflow element ID.
	ElementID = "el.id"
	// ElementType is the key for the BPMN name for the element.
	ElementType = "el.type"
	// ProcessInstanceID is the key for the unique identifier for the executing workflow instance.
	ProcessInstanceID = "pi.id"
	// WorkflowID is the key for the originating versioned workflow that started the instance.
	WorkflowID = "wf.id"
	// JobType is the key for the name of the job type associated with an executing Job.
	JobType = "job.type"
	// JobID is the key for the executing job ID.
	JobID = "job.id"
	// ParentProcessInstanceID is the key for the parent process instance if this is a spawned process
	ParentProcessInstanceID = "wf.parent.iid"
	// WorkflowName is the key for the originator workflow name.
	WorkflowName = "wf.name"
	// ParentInstanceElementID is the key for the element in the parent instance that launched a sub workflow instance.
	ParentInstanceElementID = "wf.parent.el.id"
	// Execute is a key that is used for the execution command of a Job or workflow activity.
	Execute = "wf.ex"
	// Condition is a key for a business rule to evaluate.
	Condition = "el.cond"
	// State is a key for the description of the current execution state of a workflow instance.
	State = "el.state"
	// TrackingID is a key for the unique ID for the executing state.
	TrackingID = "wf.trid"
	// ParentTrackingID is a key for the parent of the current executing state.
	ParentTrackingID = "wf.tpid"
	// ExecutionID is a key to correlate a process and any spawned sub process with each other
	ExecutionID = "e.iid"
	// ProcessName is a key for the unique name of a process
	ProcessName = "p.name"
)
