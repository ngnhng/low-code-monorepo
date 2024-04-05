package messages

import (
	"gitlab.com/shar-workflow/shar/common/subj"
)

const (
	WorkFlowJobAbortAll               = "WORKFLOW.%s.State.Job.Abort.*"               // WorkFlowJobAbortAll is the wildcard state message subject for all job abort messages.
	WorkFlowJobCompleteAll            = "WORKFLOW.%s.State.Job.Complete.*"            // WorkFlowJobCompleteAll is the wildcard state message subject for all job completion messages.
	WorkflowActivityAbort             = "WORKFLOW.%s.State.Activity.Abort"            // WorkflowActivityAbort is the state message subject for aborting an activity.
	WorkflowActivityAll               = "WORKFLOW.%s.State.Activity.>"                // WorkflowActivityAll is the wildcard state message subject for all activity messages.
	WorkflowActivityComplete          = "WORKFLOW.%s.State.Activity.Complete"         // WorkflowActivityComplete is the state message subject for completing an activity.
	WorkflowActivityExecute           = "WORKFLOW.%s.State.Activity.Execute"          // WorkflowActivityExecute is the state message subject for executing an activity.
	WorkflowCommands                  = "WORKFLOW.%s.Command.>"                       // WorkflowCommands is the wildcard state message subject for all workflow commands.
	WorkflowElementTimedExecute       = "WORKFLOW.%s.Timers.ElementExecute"           // WorkflowElementTimedExecute is the state message subject for a timed element execute operation.
	WorkflowGeneralAbortAll           = "WORKFLOW.%s.State.*.Abort"                   // WorkflowGeneralAbortAll is the wildcard state message subject for all abort messages/.
	WorkflowExecutionAbort            = "WORKFLOW.%s.State.Execution.Abort"           // WorkflowExecutionAbort is the state message subject for an execution instace being aborted.
	WorkflowExecutionAll              = "WORKFLOW.%s.State.Execution.>"               // WorkflowExecutionAll is the wildcard state message subject for all execution state messages.
	WorkflowExecutionComplete         = "WORKFLOW.%s.State.Execution.Complete"        // WorkflowExecutionComplete is the state message subject for completing an execution instance.
	WorkflowExecutionExecute          = "WORKFLOW.%s.State.Execution.Execute"         // WorkflowExecutionExecute is the state message subject for executing an execution instance.
	ExecutionTerminated               = "WORKFLOW.%s.State.Execution.Terminated"      // ExecutionTerminated is the state message subject for an execution instance terminating.
	WorkflowJobAwaitMessageExecute    = "WORKFLOW.%s.State.Job.Execute.AwaitMessage"  // WorkflowJobAwaitMessageExecute is the state message subject for awaiting a message.
	WorkflowJobAwaitMessageComplete   = "WORKFLOW.%s.State.Job.Complete.AwaitMessage" // WorkflowJobAwaitMessageComplete is the state message subject for completing awaiting a message.
	WorkflowJobAwaitMessageAbort      = "WORKFLOW.%s.State.Job.Abort.AwaitMessage"    // WorkflowJobAwaitMessageAbort is the state message subject for aborting awaiting a message.
	WorkflowJobLaunchComplete         = "WORKFLOW.%s.State.Job.Complete.Launch"       // WorkflowJobLaunchComplete is the state message subject for completing a launch subworkflow task.
	WorkflowJobLaunchExecute          = "WORKFLOW.%s.State.Job.Execute.Launch"        // WorkflowJobLaunchExecute is the state message subject for executing a launch subworkflow task.
	WorkflowJobManualTaskAbort        = "WORKFLOW.%s.State.Job.Abort.ManualTask"      // WorkflowJobManualTaskAbort is the state message subject for sborting a manual task.
	WorkflowJobManualTaskComplete     = "WORKFLOW.%s.State.Job.Complete.ManualTask"   // WorkflowJobManualTaskComplete is the state message subject for completing a manual task.
	WorkflowJobManualTaskExecute      = "WORKFLOW.%s.State.Job.Execute.ManualTask"    // WorkflowJobManualTaskExecute is the state message subject for executing a manual task.
	WorkflowJobSendMessageComplete    = "WORKFLOW.%s.State.Job.Complete.SendMessage"  // WorkflowJobSendMessageComplete is the state message subject for completing a send message task.
	WorkflowJobSendMessageExecute     = "WORKFLOW.%s.State.Job.Execute.SendMessage"   // WorkflowJobSendMessageExecute is the state message subject for executing a send workfloe message task.
	WorkflowJobSendMessageExecuteWild = "WORKFLOW.%s.State.Job.Execute.SendMessage.>" // WorkflowJobSendMessageExecuteWild is the wildcard state message subject for executing a send workfloe message task.
	WorkflowJobServiceTaskAbort       = "WORKFLOW.%s.State.Job.Abort.ServiceTask"     // WorkflowJobServiceTaskAbort is the state message subject for aborting an in progress service task.
	WorkflowJobServiceTaskComplete    = "WORKFLOW.%s.State.Job.Complete.ServiceTask"  // WorkflowJobServiceTaskComplete is the state message subject for a completed service task,
	WorkflowJobServiceTaskExecute     = "WORKFLOW.%s.State.Job.Execute.ServiceTask"   // WorkflowJobServiceTaskExecute is the raw state message subject for executing a service task.  An identifier is added to the end to route messages to the clients.
	WorkflowJobServiceTaskExecuteWild = "WORKFLOW.%s.State.Job.Execute.ServiceTask.>" // WorkflowJobServiceTaskExecuteWild is the wildcard state message subject for all execute service task messages.
	WorkflowJobTimerTaskComplete      = "WORKFLOW.%s.State.Job.Complete.Timer"        // WorkflowJobTimerTaskComplete is the state message subject for completing a timed task.
	WorkflowJobTimerTaskExecute       = "WORKFLOW.%s.State.Job.Execute.Timer"         // WorkflowJobTimerTaskExecute is the state message subject for executing a timed task.
	WorkflowJobUserTaskAbort          = "WORKFLOW.%s.State.Job.Abort.UserTask"        // WorkflowJobUserTaskAbort is the state message subject for aborting a user task.
	WorkflowJobUserTaskComplete       = "WORKFLOW.%s.State.Job.Complete.UserTask"     // WorkflowJobUserTaskComplete is the state message subject for completing a user task.
	WorkflowJobUserTaskExecute        = "WORKFLOW.%s.State.Job.Execute.UserTask"      // WorkflowJobUserTaskExecute is the state message subject for executing a user task.
	WorkflowJobGatewayTaskComplete    = "WORKFLOW.%s.State.Job.Complete.Gateway"      // WorkflowJobGatewayTaskComplete is the state message subject for completing a gateway task.
	WorkflowJobGatewayTaskExecute     = "WORKFLOW.%s.State.Job.Execute.Gateway"       // WorkflowJobGatewayTaskExecute is the state message subject for executing a gateway task.
	WorkflowJobGatewayTaskActivate    = "WORKFLOW.%s.State.Job.Activate.Gateway"      // WorkflowJobGatewayTaskActivate is the state message subject for activating a gateway task for creation or re-entry.
	WorkflowJobGatewayTaskReEnter     = "WORKFLOW.%s.State.Job.ReEnter.Gateway"       // WorkflowJobGatewayTaskReEnter is the state message subject for re entering an existing gateway task.
	WorkflowJobGatewayTaskAbort       = "WORKFLOW.%s.State.Job.Abort.Gateway"         // WorkflowJobGatewayTaskAbort is the state message subject for aborting a gateway task.
	WorkflowLog                       = "WORKFLOW.%s.State.Log"                       // WorkflowLog is the state message subject for logging messages to a workflow activity.
	WorkflowLogAll                    = "WORKFLOW.%s.State.Log.*"                     // WorkflowLogAll is the wildcard state message subject for all logging messages.
	WorkflowMessage                   = "WORKFLOW.%s.Message"                         // WorkflowMessage is the state message subject for all workflow messages.
	WorkflowProcessComplete           = "WORKFLOW.%s.State.Process.Complete"          // WorkflowProcessComplete is the state message subject for completing a workfloe process.
	WorkflowProcessExecute            = "WORKFLOW.%s.State.Process.Execute"           // WorkflowProcessExecute is the state message subject for executing a workflow process.
	WorkflowProcessTerminated         = "WORKFLOW.%s.State.Process.Terminated"        // WorkflowProcessTerminated is the state message subject for a workflow process terminating.
	WorkflowStateAll                  = "WORKFLOW.%s.State.>"                         // WorkflowStateAll is the wildcard subject for catching all state messages.
	WorkflowTimedExecute              = "WORKFLOW.%s.Timers.WorkflowExecute"          // WorkflowTimedExecute is the state message subject for timed workflow execute operation.
	WorkflowTraversalComplete         = "WORKFLOW.%s.State.Traversal.Complete"        // WorkflowTraversalComplete is the state message subject for completing a traversal.
	WorkflowTraversalExecute          = "WORKFLOW.%s.State.Traversal.Execute"         // WorkflowTraversalExecute is the state message subject for executing a new traversal.

	WorkflowSystemTaskCreate   = "WORKFLOW.System.Task.Create"   // WorkflowSystemTaskCreate is the task created broadcast message.
	WorkflowSystemTaskUpdate   = "WORKFLOW.System.Task.Update"   // WorkflowSystemTaskUpdate is the task updated broadcast message.
	WorkflowSystemProcessPause = "WORKFLOW.System.Process.Pause" // WorkflowSystemProcessPause is the process paused broadcast message.
	WorkflowSystemProcessError = "WORKFLOW.System.Process.Error" // WorkflowSystemProcessError is the process error broadcast message.

)

const (
	WorkflowTelemetryTimer = "WORKFLOW.Message.Telemetry" // WorkflowTelemetryTimer is the message subject for triggering telemetry messages from the server.
	WorkflowMessageKick    = "WORKFLOW.Message.Kick"      // WorkflowMessageKick is the message subject for triggering delivery of missed messages.
)

const (
	WorkflowTelemetryClientCount = "WORKFLOW_TELEMETRY.Client.Count" // WorkflowTelemetryClientCount is the message subject for workflow client count telemetry.
	WorkflowTelemetryLog         = "WORKFLOW_TELEMETRY.Log"          //WorkflowTelemetryLog is the message subject for telemetry logging.
)

// WorkflowLogLevel represents a subject suffix for logging levels
type WorkflowLogLevel string

const (
	LogFatal WorkflowLogLevel = ".Fatal"   // LogFatal is the suffix for a fatal error.
	LogError WorkflowLogLevel = ".Error"   // LogError is the suffix for an error.
	LogWarn  WorkflowLogLevel = ".Warning" // LogWarn is the suffix for a warning.
	LogInfo  WorkflowLogLevel = ".Info"    // LogInfo is the suffix for an information message.
	LogDebug WorkflowLogLevel = ".Debug"   // LogDebug is the suffix for a debug message.
)

// LogLevels provides a way of using an index to select a log level.
var LogLevels = []WorkflowLogLevel{
	LogFatal,
	LogError,
	LogWarn,
	LogInfo,
	LogDebug,
}

// AllMessages provides the list of subscriptions for the WORKFLOW stream.
var AllMessages = []string{
	//subj.NS(WorkflowAbortAll, "*"),
	subj.NS(WorkflowSystemTaskCreate, "*"),
	subj.NS(WorkflowSystemTaskUpdate, "*"),
	subj.NS(WorkflowSystemProcessPause, "*"),
	subj.NS(WorkflowSystemProcessError, "*"),

	subj.NS(WorkFlowJobAbortAll, "*"),
	subj.NS(WorkFlowJobCompleteAll, "*"),
	subj.NS(WorkflowActivityAbort, "*"),
	subj.NS(WorkflowActivityComplete, "*"),
	subj.NS(WorkflowActivityExecute, "*"),
	subj.NS(WorkflowCommands, "*"),
	subj.NS(WorkflowElementTimedExecute, "*"),
	subj.NS(WorkflowExecutionAll, "*"),
	subj.NS(WorkflowJobAwaitMessageExecute, "*"),
	subj.NS(WorkflowJobLaunchExecute, "*"),
	subj.NS(WorkflowJobManualTaskExecute, "*"),
	subj.NS(WorkflowJobSendMessageExecuteWild, "*"),
	subj.NS(WorkflowJobServiceTaskExecuteWild, "*"),
	subj.NS(WorkflowJobGatewayTaskExecute, "*"),
	subj.NS(WorkflowJobTimerTaskExecute, "*"),
	subj.NS(WorkflowJobUserTaskExecute, "*"),
	subj.NS(WorkflowLogAll, "*"),
	subj.NS(WorkflowMessage, "*"),
	subj.NS(WorkflowProcessComplete, "*"),
	subj.NS(WorkflowProcessExecute, "*"),
	subj.NS(WorkflowProcessTerminated, "*"),
	subj.NS(WorkflowTimedExecute, "*"),
	subj.NS(WorkflowTraversalComplete, "*"),
	subj.NS(WorkflowTraversalExecute, "*"),
	subj.NS(WorkflowJobGatewayTaskActivate, "*"),
	subj.NS(WorkflowJobGatewayTaskReEnter, "*"),
	WorkflowTelemetryTimer,
	WorkflowMessageKick,
	"$JS.EVENT.ADVISORY.CONSUMER.MAX_DELIVERIES.WORKFLOW.>", // Dead letter functionality
}

// WorkflowMessageFormat provides the template for sending workflow messages.
var WorkflowMessageFormat = "WORKFLOW.%s.Message.%s"

const (
	APIAll                      = "WORKFLOW.Api.*"                        // APIAll is all API message subjects.
	APIStoreWorkflow            = "WORKFLOW.Api.StoreWorkflow"            // APIStoreWorkflow is the store Workflow API subject.
	APILaunchProcess            = "WORKFLOW.Api.LaunchProcess"            // APILaunchProcess is the launch process API subject.
	APIListWorkflows            = "WORKFLOW.Api.ListWorkflows"            // APIListWorkflows is the list workflows API subject.
	APIListExecution            = "WORKFLOW.Api.ListExecution"            // APIListExecution is the list workflow instances API subject.
	APIListExecutionProcesses   = "WORKFLOW.Api.ListExecutionProcesses"   // APIListExecutionProcesses is the get processes of a running workflow instance API subject.
	APICancelExecution          = "WORKFLOW.Api.CancelExecution"          // APICancelExecution is the cancel an execution API subject.
	APISendMessage              = "WORKFLOW.Api.SendMessage"              // APISendMessage is the send workflow message API subject.
	APICancelProcessInstance    = "WORKFLOW.API.CancelProcessInstance"    // APICancelProcessInstance is the cancel process instance API message subject.
	APICompleteManualTask       = "WORKFLOW.Api.CompleteManualTask"       // APICompleteManualTask is the complete manual task API subject.
	APICompleteServiceTask      = "WORKFLOW.Api.CompleteServiceTask"      // APICompleteServiceTask is the complete service task API subject.
	APICompleteUserTask         = "WORKFLOW.Api.CompleteUserTask"         // APICompleteUserTask is the complete user task API subject.
	APICompleteSendMessageTask  = "WORKFLOW.Api.CompleteSendMessageTask"  // APICompleteSendMessageTask is the complete send message task API subject.
	APIDeprecateServiceTask     = "WORKFLOW.Api.DeprecateServiceTask"     // APIDeprecateServiceTask is the deprecate service task API subject.
	APIListUserTaskIDs          = "WORKFLOW.Api.ListUserTaskIDs"          // APIListUserTaskIDs is the list user task IDs API subject.
	APIGetUserTask              = "WORKFLOW.Api.GetUserTask"              // APIGetUserTask is the get user task API subject.
	APIGetTaskSpecVersions      = "WORKFLOW.Api.GetTaskSpecVersions"      // APIGetTaskSpecVersions is the get task versions API subject.
	APIHandleWorkflowError      = "WORKFLOW.Api.HandleWorkflowError"      // APIHandleWorkflowError is the handle workflow error API subject.
	APIRegisterTask             = "Workflow.Api.RegisterTask"             // APIRegisterTask registers a task with SHAR and returns the id.  If the task already exists then the ID is returned of the existing task.
	APIGetProcessInstanceStatus = "WORKFLOW.Api.GetProcessInstanceStatus" // APIGetProcessInstanceStatus is the get process instance status API subject.
	APIGetTaskSpec              = "WORKFLOW.Api.GetTaskSpec"              // APIGetTaskSpec is the get task spec API message subject.
	APIGetWorkflowVersions      = "WORKFLOW.Api.GetWorkflowVersions"      // APIGetWorkflowVersions is the get workflow versions API message subject.
	APIGetWorkflow              = "WORKFLOW.Api.GetWorkflow"              // APIGetWorkflow is the get workflow API message subject.
	APIGetProcessHistory        = "WORKFLOW.Api.GetProcessHistory"        // APIGetProcessHistory is the get process history API message subject.
	APIGetVersionInfo           = "WORKFLOW.API.GetVersionInfo"           // APIGetVersionInfo is the get server version information API message subject.
	APIGetTaskSpecUsage         = "WORKFLOW.Api.GetTaskSpecUsage"         // APIGetTaskSpecUsage is the get task spec usage API message subject.
	APIListTaskSpecUIDs         = "WORKFLOW.Api.ListTaskSpecUIDs"         // APIListTaskSpecUIDs is the list task spec UIDs API message subject.
	APIHeartbeat                = "WORKFLOW.Api.Heartbeat"                // APIHeartbeat // is the heartbeat API message subject.
	APILog                      = "WORKFLOW.Api.Log"                      // APILog // is the client logging message subject.
	APIGetJob                   = "WORKFLOW.Api.GetJob"                   // APIGetJob is the get job API subject.
)

var (
	KvJob              = "WORKFLOW_JOB"             // KvJob is the name of the key value store that holds workflow jobs.
	KvVersion          = "WORKFLOW_VERSION"         // KvVersion is the name of the key value store that holds an ordered list of workflow version IDs for a given workflow
	KvDefinition       = "WORKFLOW_DEF"             // KvDefinition is the name of the key value store that holds the state machine definition for workflows
	KvTracking         = "WORKFLOW_TRACKING"        // KvTracking is the name of the key value store that holds the state of a workflow task.
	KvInstance         = "WORKFLOW_INSTANCE"        // KvInstance is the name of the key value store that holds workflow instance information.
	KvExecution        = "WORKFLOW_EXECUTION"       // KvExecution is the name of the key value store that holds execution information.
	KvMessageInterest  = "WORKFLOW_MSGNAME"         // KvMessageInterest is the name of the key value store that holds recipients for messages.
	KvUserTask         = "WORKFLOW_USERTASK"        // KvUserTask is the name of the key value store that holds active user tasks.
	KvOwnerName        = "WORKFLOW_OWNERNAME"       // KvOwnerName is the name of the key value store that holds owner names for owner IDs
	KvOwnerID          = "WORKFLOW_OWNERID"         // KvOwnerID is the name of the key value store that holds owner IDs for owner names.
	KvClientTaskID     = "WORKFLOW_CLIENTTASK"      // KvClientTaskID is the name of the key value store that holds the unique ID used by clients to subscribe to service task messages.
	KvWfName           = "WORKFLOW_NAME"            // KvWfName is the name of the key value store that holds workflow IDs for workflow names.
	KvVarState         = "WORKFLOW_VARSTATE"        // KvVarState is the name of the key value store that holds the state of variables upon entering a task.
	KvProcessInstance  = "WORKFLOW_PROCESS"         // KvProcessInstance is the name of the key value store holding process instances.
	KvGateway          = "WORKFLOW_GATEWAY"         // KvGateway is the name of the key value store holding gateway instances.
	KvHistory          = "WORKFLOW_HISTORY"         // KvHistory is the name of the key value store holding process histories.
	KvLock             = "WORKFLOW_GENLCK"          // KvLock is the name of the key value store holding locks.
	KvMessageTypes     = "WORKFLOW_MSGTYPES"        // KvMessageTypes is the name of the key value store containing known message types.
	KvTaskSpecVersions = "WORKFLOW_TSPECVER"        // KvTaskSpecVersions is the name of the key value store holding task specification versions.
	KvTaskSpec         = "WORKFLOW_TSKSPEC"         // KvTaskSpec is the name of the key value store holding task specification.
	KvProcess          = "WORKFLOW_PROCESS_MAPPING" // KvProcess is the name of the key value store mapping process names to workflow names.
	KvMessages         = "WORKFLOW_MESSAGES"        // KvMessages is the name of the key value store containing messages.
	KvClients          = "WORKFLOW_CLIENTS"         // KvClients is the name of the key value store containing connected clients.
)
