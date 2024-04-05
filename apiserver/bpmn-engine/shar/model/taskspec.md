### TaskSpec

| name | type | description | validation |
|------|------|-------------|------------|
| version | string | Version of task specification. | "1.0" |
| kind | string | Kind of task specification. | "ServiceTask" or "UserTask". |
| metadata | TaskMetadata | Metadata document any non functional information regarding the TaskSpec. |  -  |
| behaviour | TaskBehaviour | Behaviour documents instance behaviour. |  -  |
| parameters | TaskParameters | Parameters document input and output parameters for the task. |  -  |
| events | TaskEvents | Events document errors and messages that can be emitted from the task. |  -  |
### TaskParameters

| name | type | description | validation |
|------|------|-------------|------------|
| parameterGroup | ParameterGroup | ParameterGroup is a list of parameters with their categorization.  This is useful for display. | arbitrary string |
| input | Parameter | Input documents input parameters to the task. |  -  |
| output | Parameter | Output documents output parameters for the task. |  -  |
### ParameterGroup

| name | type | description | validation |
|------|------|-------------|------------|
| name | string | Name of the parameter group. | arbitrary string |
| short | string | Short description of the parameter group. | arbitrary string |
| description | string | Description - a long description of the parameter group. | arbitrary string |
### Parameter

| name | type | description | validation |
|------|------|-------------|------------|
| name | string | Name of the parameter. | arbitrary string |
| short | string | Short description of the parameter. | arbitrary string |
| description | string | Description - a long description of the parameter. | arbitrary string |
| type | string | Type of the parameter. | "string", "int", "float", "bool" |
| customTypeExtension | string | Subtype describing the use of the type. | eg. "IPAddress" |
| collection | bool | Collection specifies the parameter is an array. | bool |
| group | string | Group declares this parameter as part of a named parameter group. | parameter group name. |
| extensionData | map[string]string | ExtensionData - a map of values that can be used by third party tools. | arbitrary map of string/string |
| mandatory | bool | Mandatory specifies that this parameter is required. | bool |
| validateExpr | string | ValidateExpr - an EXPR that is used to validate the field value. | a valid EXPR expression prefixed by'=' |
| example | string | Example - an example EXPR that is used to provide a hint to a user on the nature of a task.  It is also used when the task is being used as a mock before implementation. | a valid EXPR expression prefixed by'=' |
### TaskEvents

| name | type | description | validation |
|------|------|-------------|------------|
| error | TaskError | Error workflow events that can be returned from the task. |  -  |
| message | Message | Message workflow events that can be returned from the task. |  -  |
### TaskError

| name | type | description | validation |
|------|------|-------------|------------|
| name | string | Name of the error. | arbitrary string |
| code | string | Code a unique code for the error. | NATS-safe identifier |
| short | string | Short description of the error. | arbitrary string |
| description | string | Description - a long description of the error. | arbitrary string |
### Message

| name | type | description | validation |
|------|------|-------------|------------|
| name | string | Name - Message name for a workflow message. | arbitrary string |
| correlationKey | string | CorrelationKey - the workflow message correlation key. | NATS-safe identifier |
| short | string | Short description of the parameter. | arbitrary string |
| description | string | Description - a long description of the parameter. | arbitrary string |
### TaskMetadata

| name | type | description | validation |
|------|------|-------------|------------|
| uid | string | Uid of the task. | a ksuid |
| type | string | Type - the name for the task when referred to by process. | arbitrary string |
| version | string | Version - the task version number.  This is useful to describe that the task has internally changed without modifying the input/outout parameters. | semantic version number |
| short | string | Short description of the task. | arbitrary string |
| description | string | Description - a long description of the task. | arbitrary string |
| labels | string | Labels - a list of searchable tags for the task. | arbitrary string |
| extensionData | map[string]string | ExtensionData - a map of values that can be used by third party tools. | arbitrary string |
### TaskBehaviour

| name | type | description | validation |
|------|------|-------------|------------|
| defaultRetry | DefaultTaskRetry | Retry - the recommended retry behavior for the task, this could be overriden by a workflow. |  -  |
| estimatedMaxDuration | uint64 | EstimatedMaxDuration documents how long the task is expected to run for. | a unix millisecond duration |
| unsafe | bool | Unsafe labels the task as non-idempotent.  Non-idempotent tasks are highly unrecommended. | boolean |
| mock | bool | Mock this task as it has no concrete implementation. | boolean |
| deprecated | bool | Deprecated task.  Workflows can not be executed that include this task. | boolean |
### DefaultTaskRetry

| name | type | description | validation |
|------|------|-------------|------------|
| number | uint32 | Retry - the recommended number of retries for the task. | arbitrary positive integer |
| strategy | RetryStrategy | Strategy for retrying the task. |  enum  |
| initMilli | int64 | InitMilli - initial backoff delay for Static, Linear, Incremental. | positive int |
| intervalMilli | int64 | IntervalMilli - delay interval (Linear) amount to add each attempt (Incremental). | positive int |
| maxMilli | int64 | MaxMilli - delay ceiling (Static, Linear, Incremental). | positive int |
| defaultExceeded | DefaultRetryExceededBehaviour | DefaultExceeded - specifies what to do by default when the attempts have been exhausted.  This only specifies the strategy, and doesn't contain runtime parameters. |  -  |
### DefaultRetryExceededBehaviour

| name | type | description | validation |
|------|------|-------------|------------|
| action | RetryErrorAction | Action to take when retries are exceeded. |  enum  |
| variable | string | Variable - name of variable to set for the SetVariableValue action. | shar-variable |
| variableType | string | VariableType - type of the variable for the SetVariableValue action. | "string", "int", "float", "bool" |
| variableValue | string | Variable value to set for the SetVariableValue action. | arbitrary string representation of a valid value for variableType |
| errorCode | string | ErrorCode for the ThrowWorkflowError action. | a valid workflow error code for the task. |
### RetryErrorAction (Enum)

| name | value | description |
|------|------|-------------|
| PauseWorkflow | 0 | PauseWorkflow - exhausting retries will pause the workflow and send a shar operational message. |
| ThrowWorkflowError | 1 | ThrowWorkflowError - throw a workflow error. |
| SetVariableValue | 2 | SetVariableValue - set a workflow variable value. |
| FailWorkflow | 3 | FailWorkflow - exhausting retries will fail the workflow. |
### RetryStrategy (Enum)

| name | value | description |
|------|------|-------------|
| Linear | 0 | Retry at regular intervals. |
| Incremental | 1 | Retry at increasingly large intervals. |
