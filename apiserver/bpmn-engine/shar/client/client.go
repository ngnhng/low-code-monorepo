package client

import (
	"bytes"
	"compress/gzip"
	"context"
	"errors"
	"fmt"
	"github.com/hashicorp/go-version"
	"github.com/nats-io/nats.go"
	"github.com/segmentio/ksuid"
	"gitlab.com/shar-workflow/shar/client/api"
	"gitlab.com/shar-workflow/shar/client/parser"
	"gitlab.com/shar-workflow/shar/common"
	"gitlab.com/shar-workflow/shar/common/ctxkey"
	"gitlab.com/shar-workflow/shar/common/element"
	"gitlab.com/shar-workflow/shar/common/header"
	"gitlab.com/shar-workflow/shar/common/logx"
	middleware2 "gitlab.com/shar-workflow/shar/common/middleware"
	ns "gitlab.com/shar-workflow/shar/common/namespace"
	"gitlab.com/shar-workflow/shar/common/setup"
	"gitlab.com/shar-workflow/shar/common/setup/upgrader"
	"gitlab.com/shar-workflow/shar/common/subj"
	"gitlab.com/shar-workflow/shar/common/telemetry"
	version2 "gitlab.com/shar-workflow/shar/common/version"
	"gitlab.com/shar-workflow/shar/common/workflow"
	api2 "gitlab.com/shar-workflow/shar/internal/client/api"
	"gitlab.com/shar-workflow/shar/internal/natsrpc"
	"gitlab.com/shar-workflow/shar/model"
	errors2 "gitlab.com/shar-workflow/shar/server/errors"
	"gitlab.com/shar-workflow/shar/server/errors/keys"
	"gitlab.com/shar-workflow/shar/server/messages"
	"gitlab.com/shar-workflow/shar/server/vars"
	"go.opentelemetry.io/otel/trace"
	"google.golang.org/grpc/codes"
	"google.golang.org/protobuf/proto"
	"io"
	"log/slog"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"testing"
	"time"
)

// HeartBeatInterval defines the time between client heartbeats.
const HeartBeatInterval = 1 * time.Second

type contextKey string

const internalProcessInstanceId contextKey = "__INTERNAL_PIID"

// LogClient represents a client which is capable of logging to the SHAR infrastructure.
type LogClient interface {
	// Log logs to the underlying SHAR infrastructure.
	Log(ctx context.Context, level slog.Level, message string, attrs map[string]string) error
}

// JobClient represents a client that is sent to all service tasks to facilitate logging.
type JobClient interface {
	LogClient
}

type jobClient struct {
	cl         *Client
	trackingID string
}

// Log logs to the span related to this jobClient instance.
func (c *jobClient) Log(ctx context.Context, level slog.Level, message string, attrs map[string]string) error {
	return c.cl.clientLog(ctx, c.trackingID, level, message, attrs)
}

// MessageClient represents a client which supports logging and sending Workflow Messages to the underlying SHAR instrastructure.
type MessageClient interface {
	LogClient
	// SendMessage sends a Workflow Message
	SendMessage(ctx context.Context, name string, key any, vars model.Vars) error
}

type messageClient struct {
	cl          *Client
	executionId string
	trackingID  string
}

// SendMessage sends a Workflow Message into the SHAR engine
func (c *messageClient) SendMessage(ctx context.Context, name string, key any, vars model.Vars) error {
	return c.cl.SendMessage(ctx, name, key, vars)
}

// Log logs to the span related to this jobClient instance.
func (c *messageClient) Log(ctx context.Context, level slog.Level, message string, attrs map[string]string) error {
	return c.cl.clientLog(ctx, c.trackingID, level, message, attrs)
}

// ServiceFn provides the signature for service task functions.
type ServiceFn func(ctx context.Context, client JobClient, vars model.Vars) (model.Vars, error)

// ProcessTerminateFn provides the signature for process terminate functions.
type ProcessTerminateFn func(ctx context.Context, vars model.Vars, wfError *model.Error, endState model.CancellationState)

// SenderFn provides the signature for functions that can act as Workflow Message senders.
type SenderFn func(ctx context.Context, client MessageClient, vars model.Vars) error

// Client implements a SHAR client capable of listening for service task activations, listening for Workflow Messages, and interating with the API
type Client struct {
	id                              string
	host                            string
	js                              nats.JetStreamContext
	SvcTasks                        map[string]ServiceFn
	con                             *nats.Conn
	MsgSender                       map[string]SenderFn
	storageType                     nats.StorageType
	ns                              string
	listenTasks                     map[string]struct{}
	msgListenTasks                  map[string]struct{}
	proCompleteTasks                map[string]ProcessTerminateFn
	txJS                            nats.JetStreamContext
	txCon                           *nats.Conn
	concurrency                     int
	ExpectedCompatibleServerVersion *version.Version
	ExpectedServerVersion           *version.Version
	version                         *version.Version
	noRecovery                      bool
	shar                            natsrpc.SharClient
	closer                          chan struct{}
	shutdownOnce                    sync.Once
	sig                             chan os.Signal
	processing                      int
	processingMx                    sync.Mutex
	noOSSig                         bool
	telemetryConfig                 telemetry.Config
	SendMiddleware                  []middleware2.Send
	ReceiveMiddleware               []middleware2.Receive
}

// New creates a new SHAR client instance
func New(option ...ConfigurationOption) *Client {
	ver, err := version.NewVersion(version2.Version)
	if err != nil {
		panic(err)
	}
	host, err := os.Hostname()
	if err != nil {
		panic(err)
	}
	client := &Client{
		id:                              ksuid.New().String(),
		host:                            host,
		storageType:                     nats.FileStorage,
		SvcTasks:                        make(map[string]ServiceFn),
		MsgSender:                       make(map[string]SenderFn),
		listenTasks:                     make(map[string]struct{}),
		msgListenTasks:                  make(map[string]struct{}),
		proCompleteTasks:                make(map[string]ProcessTerminateFn),
		ns:                              ns.Default,
		concurrency:                     10,
		version:                         ver,
		ExpectedCompatibleServerVersion: upgrader.GetCompatibleVersion(),
		closer:                          make(chan struct{}),
		sig:                             make(chan os.Signal),
		telemetryConfig:                 telemetry.Config{Enabled: false},
		SendMiddleware:                  make([]middleware2.Send, 0),
		ReceiveMiddleware:               make([]middleware2.Receive, 0),
	}
	for _, i := range option {
		i.configure(client)
	}
	return client
}

// Dial instructs the client to connect to a NATS server.
func (c *Client) Dial(ctx context.Context, natsURL string, opts ...nats.Option) error {

	if c.telemetryConfig.Enabled {
		c.SendMiddleware = append(c.SendMiddleware,
			telemetry.CtxSpanToNatsMsgMiddleware(),
		)
		c.ReceiveMiddleware = append(c.ReceiveMiddleware,
			telemetry.NatsMsgToCtxWithSpanMiddleware(),
		)
	}

	n, err := nats.Connect(natsURL, opts...)
	if err != nil {
		return c.clientErr(context.Background(), err)
	}
	txnc, err := nats.Connect(natsURL, opts...)
	if err != nil {
		return c.clientErr(context.Background(), err)
	}
	js, err := n.JetStream()
	if err != nil {
		return c.clientErr(context.Background(), err)
	}
	txJS, err := txnc.JetStream()
	if err != nil {
		return c.clientErr(context.Background(), err)
	}
	c.js = js
	c.txJS = txJS
	c.con = n
	c.txCon = txnc
	c.shar = natsrpc.NewSharClient(c.con, nil, nil)
	_, err = c.GetServerVersion(ctx)
	if err != nil {
		return fmt.Errorf("server version: %w", err)
	}

	cdef := &nats.ConsumerConfig{
		Durable:         "ProcessTerminateConsumer_" + c.ns,
		Description:     "Processing queue for process end",
		AckPolicy:       nats.AckExplicitPolicy,
		AckWait:         30 * time.Second,
		FilterSubject:   subj.NS(messages.WorkflowProcessTerminated, c.ns),
		MaxAckPending:   65535,
		MaxRequestBatch: 1,
	}
	if err := setup.EnsureConsumer(js, "WORKFLOW", *cdef, false, c.storageType); err != nil {
		return fmt.Errorf("setting up end event queue")
	}

	return nil
}

// DeprecateTaskSpec deprecates a task spec by name.
func (c *Client) DeprecateTaskSpec(ctx context.Context, name string) error {
	req := &model.DeprecateServiceTaskRequest{
		Name: name,
	}
	res := &model.DeprecateServiceTaskResponse{}
	ctx = subj.SetNS(ctx, c.ns)
	if err := api2.Call(ctx, c.txCon, messages.APIDeprecateServiceTask, c.ExpectedCompatibleServerVersion, c.SendMiddleware, req, res); err != nil {
		return c.clientErr(ctx, err)
	}
	if !res.Success {
		return &ErrTaskInUse{Err: fmt.Errorf("attempt to deprectate a task in use"), Usage: res.Usage}
	}
	return nil
}

// RegisterTask registers a task spec with SHAR.
func (c *Client) RegisterTask(ctx context.Context, spec *model.TaskSpec, fn ServiceFn) error {
	id, err := c.registerServiceTask(ctx, spec)
	if err != nil {
		return fmt.Errorf("register service task: %w", err)
	}
	spec.Metadata.Uid = id

	if fn != nil {
		if _, ok := c.SvcTasks[id]; ok {
			return fmt.Errorf("service task '%s' already registered: %w", spec.Metadata.Type, errors2.ErrServiceTaskAlreadyRegistered)
		}
		c.SvcTasks[id] = fn
		c.listenTasks[id] = struct{}{}
	}
	return nil
}

// RegisterMessageSender registers a function that requires support for sending Workflow Messages
func (c *Client) RegisterMessageSender(ctx context.Context, workflowName string, messageName string, sender SenderFn) error {
	if _, ok := c.MsgSender[workflowName+"_"+messageName]; ok {
		return fmt.Errorf("message sender '%s' already registered: %w", messageName, errors2.ErrMessageSenderAlreadyRegistered)
	}
	c.MsgSender[workflowName+"_"+messageName] = sender
	c.msgListenTasks[workflowName+"_"+messageName] = struct{}{}
	return nil
}

// Listen starts processing the client message queues.
func (c *Client) Listen(ctx context.Context) error {
	if err := c.listen(ctx); err != nil {
		return c.clientErr(ctx, err)
	}
	c.listenTerm(ctx)
	if err := c.listenProcessTerminate(ctx); err != nil {
		return c.clientErr(ctx, err)
	}
	if err := c.startHeart(ctx); err != nil {
		return c.clientErr(ctx, err)
	}
	return nil
}

func (c *Client) listen(ctx context.Context) error {
	ctx = context.WithValue(ctx, ctxkey.SharNamespace, c.ns)
	tasks := make(map[string]string)
	for i := range c.listenTasks {
		tasks[i] = subj.NS(messages.WorkflowJobServiceTaskExecute+"."+i, c.ns)
	}
	for i := range c.msgListenTasks {
		tasks[i] = subj.NS(messages.WorkflowJobSendMessageExecute+"."+i, c.ns)
	}
	for k, v := range tasks {
		cName := "ServiceTask_" + c.ns + "_" + k
		cInf, err := c.js.ConsumerInfo("WORKFLOW", cName)
		if err != nil {
			return fmt.Errorf("listen obtaining consumer info for %s: %w", cName, err)
		}
		ackTimeout := cInf.Config.AckWait
		err = common.Process(ctx, c.js, "WORKFLOW", "jobExecute", c.closer, v, cName, c.concurrency, c.ReceiveMiddleware, func(ctx context.Context, log *slog.Logger, msg *nats.Msg) (bool, error) {
			c.processingMx.Lock()
			c.processing++
			c.processingMx.Unlock()
			defer func() {
				c.processingMx.Lock()
				c.processing--
				c.processingMx.Unlock()
			}()
			// Check version compatibility of incoming call.
			sharCompat := msg.Header.Get(header.NatsCompatHeader)
			if sharCompat != "" {
				sVer, err := version.NewVersion(sharCompat)
				if err != nil {
					return false, fmt.Errorf("compatibility issue: shar server version corrupt %s: %w", sVer, err)
				}

				if compat, ver := upgrader.IsCompatible(sVer); !compat {
					return false, fmt.Errorf("compatibility issue: shar server level %s, client version level: %s: %w", sVer, ver, err)
				}
			}

			// Start a loop keeping this connection alive.
			ctx, cancel := context.WithCancel(ctx)
			defer cancel()
			var fnMx sync.Mutex
			waitCancelSig := make(chan struct{})

			// Acknowledge until waitCancel is closed
			go func(ctx context.Context) {
				select {
				case <-time.After(ackTimeout / 2):

				case <-waitCancelSig:
					cancel()
					return
				}
				fnMx.Lock()
				select {
				case <-waitCancelSig:
					cancel()
					return
				default:
				}
				if err := msg.InProgress(nats.Context(ctx)); err != nil {
					cancel()
					fnMx.Unlock()
					return
				}
				fnMx.Unlock()
			}(ctx)

			ut := &model.WorkflowState{}
			if err := proto.Unmarshal(msg.Data, ut); err != nil {
				log.Error("unmarshalling", err)
				return false, fmt.Errorf("service task listener: %w", err)
			}

			subj.SetNS(ctx, msg.Header.Get(header.SharNamespace))
			ctx = context.WithValue(ctx, ctxkey.ExecutionID, ut.ExecutionId)
			ctx = context.WithValue(ctx, ctxkey.ProcessInstanceID, ut.ProcessInstanceId)
			ctx = ReParentSpan(ctx, ut)
			ctx, err := header.FromMsgHeaderToCtx(ctx, msg.Header)
			if err != nil {
				return true, &errors2.ErrWorkflowFatal{Err: fmt.Errorf("obtain headers from message: %w", err)}
			}

			switch ut.ElementType {
			case element.ServiceTask:
				trackingID := common.TrackingID(ut.Id).ID()
				job, err := c.GetJob(ctx, trackingID)
				if err != nil {
					log.Error("get job", err, slog.String("JobId", trackingID))
					return false, fmt.Errorf("get service task job kv: %w", err)
				}

				svcFn, ok := c.SvcTasks[job.ExecuteVersion]

				if !ok {
					log.Error("find service function", err, slog.String("fn", *job.Execute))
					return false, fmt.Errorf("find service task function: %w", errors2.ErrWorkflowFatal{Err: err})
				}
				dv, err := vars.Decode(ctx, job.Vars)
				if err != nil {
					log.Error("decode vars", err, slog.String("fn", *job.Execute))
					return false, fmt.Errorf("decode service task job variables: %w", err)
				}
				newVars, err := func() (v model.Vars, e error) {
					if !c.noRecovery {
						defer func() {
							if r := recover(); r != nil {
								v = model.Vars{}
								e = &errors2.ErrWorkflowFatal{Err: fmt.Errorf("call to service task \"%s\" terminated in panic: %w", *ut.Execute, r.(error))}
							}
						}()
					}
					fnMx.Lock()
					pidCtx := context.WithValue(ctx, internalProcessInstanceId, job.ProcessInstanceId)
					pidCtx = ReParentSpan(pidCtx, job)
					v, e = svcFn(pidCtx, &jobClient{cl: c, trackingID: trackingID}, dv)
					close(waitCancelSig)
					fnMx.Unlock()
					return
				}()
				if err != nil {
					var handled bool
					wfe := &workflow.Error{}
					if errors.As(err, wfe) {
						v, err := vars.Encode(ctx, newVars)
						if err != nil {
							return true, &errors2.ErrWorkflowFatal{Err: fmt.Errorf("encode service task variables: %w", err)}
						}
						res := &model.HandleWorkflowErrorResponse{}
						req := &model.HandleWorkflowErrorRequest{TrackingId: trackingID, ErrorCode: wfe.Code, Vars: v}
						ctx = subj.SetNS(ctx, c.ns)
						if err2 := api2.Call(ctx, c.txCon, messages.APIHandleWorkflowError, c.ExpectedCompatibleServerVersion, c.SendMiddleware, req, res); err2 != nil {
							// TODO: This isn't right.  If this call fails it assumes it is handled!
							reterr := fmt.Errorf("handle workflow error: %w", err2)
							return true, logx.Err(ctx, "handle a workflow error", reterr, slog.Any("workflowError", wfe))
						}
						handled = res.Handled
					}
					if !handled {
						log.Warn("execution of service task function", "error", err)
					}
					return wfe.Code != "", err
				}
				err = c.completeServiceTask(ctx, trackingID, newVars)
				ae := &api.Error{}
				if errors.As(err, &ae) {
					if codes.Code(ae.Code) == codes.Internal {
						log.Error("complete service task", err)
						e := &model.Error{
							Id:   "",
							Name: ae.Message,
							Code: "client-" + strconv.Itoa(ae.Code),
						}
						if err := c.cancelProcessInstanceWithError(ctx, ut.ProcessInstanceId, e); err != nil {
							log.Error("cancel execution in response to fatal error", err)
						}
						return true, nil
					}
				} else if errors2.IsWorkflowFatal(err) {
					return true, err
				}
				if err != nil {
					log.Warn("complete service task", err)
					return false, fmt.Errorf("complete service task: %w", err)
				}
				return true, nil

			case element.MessageIntermediateThrowEvent:
				trackingID := common.TrackingID(ut.Id).ID()
				job, err := c.GetJob(ctx, trackingID)
				if err != nil {
					log.Error("get send message task", err, slog.String("JobId", common.TrackingID(ut.Id).ID()))
					return false, fmt.Errorf("complete send message task: %w", err)
				}
				sendFn, ok := c.MsgSender[job.WorkflowName+"_"+*job.Execute]
				if !ok {
					return true, nil
				}

				dv, err := vars.Decode(ctx, job.Vars)
				if err != nil {
					log.Error("decode vars", err, slog.String("fn", *job.Execute))
					return false, &errors2.ErrWorkflowFatal{Err: fmt.Errorf("decode send message variables: %w", err)}
				}
				ctx = context.WithValue(ctx, ctxkey.TrackingID, trackingID)
				pidCtx := context.WithValue(ctx, internalProcessInstanceId, job.ProcessInstanceId)
				pidCtx = ReParentSpan(pidCtx, job)
				if err := sendFn(pidCtx, &messageClient{cl: c, trackingID: trackingID, executionId: job.ExecutionId}, dv); err != nil {
					log.Warn("nats listener", err)
					return false, err
				}
				if err := c.completeSendMessage(ctx, trackingID, make(map[string]any)); errors2.IsWorkflowFatal(err) {
					log.Error("a fatal error occurred in message sender "+*job.Execute, err)
				} else if err != nil {
					log.Error("API error", err)
					return false, err
				}
				return true, nil
			}
			return true, nil
		}, common.WithBackoffFn(c.backoff))
		if err != nil {
			return fmt.Errorf("connect to service task consumer: %w", err)
		}
	}
	return nil
}

// ReParentSpan reparents a span in the given context with the span ID obtained from the WorkflowState ID.
// If the span context in the context is valid, it replaces the span ID with the 64-bit representation
// obtained from the WorkflowState ID. Otherwise, it returns the original context.
//
// Parameters:
// - ctx: The context to re-parent the span in.
// - state: The WorkflowState containing the ID to extract the new span ID from.
//
// Returns:
// - The context with the re-parented span ID or the original context if the span context is invalid.
func ReParentSpan(ctx context.Context, state *model.WorkflowState) context.Context {
	sCtx := trace.SpanContextFromContext(ctx)
	if sCtx.IsValid() {
		c := common.KSuidTo64bit(common.TrackingID(state.Id).ID())
		return trace.ContextWithSpanContext(ctx, sCtx.WithSpanID(c))
	}
	return ctx
}

func (c *Client) listenProcessTerminate(ctx context.Context) error {
	closer := make(chan struct{}, 1)
	err := common.Process(ctx, c.js, "WORKFLOW", "ProcessTerminateConsumer_"+c.ns, closer, subj.NS(messages.WorkflowProcessTerminated, c.ns), "ProcessTerminateConsumer_"+c.ns, 4, c.ReceiveMiddleware, func(ctx context.Context, log *slog.Logger, msg *nats.Msg) (bool, error) {
		st := &model.WorkflowState{}
		if err := proto.Unmarshal(msg.Data, st); err != nil {
			log.Error("proto unmarshal error", err)
			return true, fmt.Errorf("listenProcessTerminate unmarshalling proto: %w", err)
		}
		callCtx := context.WithValue(ctx, keys.ContextKey(keys.ProcessInstanceID), st.ProcessInstanceId)
		v, err := vars.Decode(callCtx, st.Vars)
		if err != nil {
			return true, fmt.Errorf("listenProcessTerminate decoding vars: %w", err)
		}
		if fn, ok := c.proCompleteTasks[st.ProcessName]; ok {
			fn(callCtx, v, st.Error, st.State)
		}
		return true, nil
	})
	if err != nil {
		return fmt.Errorf("listen workflow complete process: %w", err)
	}
	return nil
}

// ListUserTaskIDs returns a list of user tasks for a particular owner
func (c *Client) ListUserTaskIDs(ctx context.Context, owner string) (*model.UserTasks, error) {
	res := &model.UserTasks{}
	req := &model.ListUserTasksRequest{Owner: owner}
	ctx = subj.SetNS(ctx, c.ns)
	if err := api2.Call(ctx, c.txCon, messages.APIListUserTaskIDs, c.ExpectedCompatibleServerVersion, c.SendMiddleware, req, res); err != nil {
		return nil, c.clientErr(ctx, err)
	}
	return res, nil
}

// GetTaskSpecVersions returns all of the version IDs associated with the named task spec.
func (c *Client) GetTaskSpecVersions(ctx context.Context, name string) ([]string, error) {
	res := &model.GetTaskSpecVersionsResponse{}
	req := &model.GetTaskSpecVersionsRequest{Name: name}
	ctx = subj.SetNS(ctx, c.ns)
	if err := api2.Call(ctx, c.txCon, messages.APIGetTaskSpecVersions, c.ExpectedCompatibleServerVersion, c.SendMiddleware, req, res); err != nil {
		return nil, c.clientErr(ctx, err)
	}
	return res.Versions.Id, nil
}

// CompleteUserTask completes a task and sends the variables back to the workflow
func (c *Client) CompleteUserTask(ctx context.Context, owner string, trackingID string, newVars model.Vars) error {
	ev, err := vars.Encode(ctx, newVars)
	if err != nil {
		return fmt.Errorf("decode variables for complete user task: %w", err)
	}
	res := &model.CompleteUserTaskResponse{}
	req := &model.CompleteUserTaskRequest{Owner: owner, TrackingId: trackingID, Vars: ev}
	ctx = subj.SetNS(ctx, c.ns)
	if err := api2.Call(ctx, c.txCon, messages.APICompleteUserTask, c.ExpectedCompatibleServerVersion, c.SendMiddleware, req, res); err != nil {
		return c.clientErr(ctx, err)
	}
	return nil
}

func (c *Client) completeServiceTask(ctx context.Context, trackingID string, newVars model.Vars) error {
	ev, err := vars.Encode(ctx, newVars)
	if err != nil {
		return fmt.Errorf("decode variables for complete service task: %w", err)
	}
	res := &model.CompleteServiceTaskResponse{}
	req := &model.CompleteServiceTaskRequest{TrackingId: trackingID, Vars: ev}
	ctx = subj.SetNS(ctx, c.ns)
	if err := api2.Call(ctx, c.txCon, messages.APICompleteServiceTask, c.ExpectedCompatibleServerVersion, c.SendMiddleware, req, res); err != nil {
		return c.clientErr(ctx, err)
	}
	return nil
}

func (c *Client) completeSendMessage(ctx context.Context, trackingID string, newVars model.Vars) error {
	ev, err := vars.Encode(ctx, newVars)
	if err != nil {
		return fmt.Errorf("decode variables for complete send message: %w", err)
	}
	res := &model.CompleteSendMessageResponse{}
	req := &model.CompleteSendMessageRequest{TrackingId: trackingID, Vars: ev}
	ctx = subj.SetNS(ctx, c.ns)
	if err := api2.Call(ctx, c.txCon, messages.APICompleteSendMessageTask, c.ExpectedCompatibleServerVersion, c.SendMiddleware, req, res); err != nil {
		return c.clientErr(ctx, err)
	}
	return nil
}

// LoadBPMNWorkflowFromBytes loads, parses, and stores a BPMN workflow in SHAR.
func (c *Client) LoadBPMNWorkflowFromBytes(ctx context.Context, name string, b []byte) (string, error) {
	rdr := bytes.NewReader(b)
	wf, err := parser.Parse(name, rdr)
	if err != nil {
		return "", c.clientErr(ctx, err)
	}
	rdr = bytes.NewReader(b)
	compressed := &bytes.Buffer{}
	archiver := gzip.NewWriter(compressed)
	if _, err := io.Copy(archiver, rdr); err != nil {
		return "", fmt.Errorf("fasiled to compress source: %w", err)
	}
	if err := archiver.Close(); err != nil {
		return "", fmt.Errorf("fasiled to complete source compression: %w", err)
	}
	wf.GzipSource = compressed.Bytes()

	res := &model.StoreWorkflowResponse{}
	ctx = subj.SetNS(ctx, c.ns)
	if err := api2.Call(ctx, c.txCon, messages.APIStoreWorkflow, c.ExpectedCompatibleServerVersion, c.SendMiddleware, &model.StoreWorkflowRequest{Workflow: wf}, res); err != nil {
		return "", c.clientErr(ctx, err)
	}
	return res.WorkflowId, nil
}

// HasWorkflowDefinitionChanged - given a workflow name and a BPMN xml, return true if the resulting definition is different.
func (c *Client) HasWorkflowDefinitionChanged(ctx context.Context, name string, b []byte) (bool, error) {
	versions, err := c.GetWorkflowVersions(ctx, name)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			return true, nil
		}
		return false, err
	}
	rdr := bytes.NewReader(b)
	wf, err := parser.Parse(name, rdr)
	if err != nil {
		return false, c.clientErr(ctx, err)
	}
	hash, err := workflow.GetHash(wf)
	if err != nil {
		return false, c.clientErr(ctx, err)
	}
	return !bytes.Equal(versions.Version[len(versions.Version)-1].Sha256, hash), nil
}

// GetWorkflowVersions - returns a list of versions for a given workflow.
func (c *Client) GetWorkflowVersions(ctx context.Context, name string) (*model.WorkflowVersions, error) {
	req := &model.GetWorkflowVersionsRequest{
		Name: name,
	}
	res := &model.GetWorkflowVersionsResponse{}
	ctx = subj.SetNS(ctx, c.ns)
	if err := api2.Call(ctx, c.txCon, messages.APIGetWorkflowVersions, c.ExpectedCompatibleServerVersion, c.SendMiddleware, req, res); err != nil {
		return nil, c.clientErr(ctx, err)
	}
	return res.Versions, nil
}

// GetWorkflow - retrieves a workflow model given its ID
func (c *Client) GetWorkflow(ctx context.Context, id string) (*model.Workflow, error) {
	req := &model.GetWorkflowRequest{
		Id: id,
	}
	res := &model.GetWorkflowResponse{}
	ctx = subj.SetNS(ctx, c.ns)
	if err := api2.Call(ctx, c.txCon, messages.APIGetWorkflow, c.ExpectedCompatibleServerVersion, c.SendMiddleware, req, res); err != nil {
		return nil, c.clientErr(ctx, err)
	}
	return res.Definition, nil
}

// GetTaskSpecUsage returns a report outlining task spec usage in executable and executing workflows.
func (c *Client) GetTaskSpecUsage(ctx context.Context, id string) (*model.TaskSpecUsageReport, error) {
	req := &model.GetTaskSpecUsageRequest{
		Id: id,
	}
	res := &model.TaskSpecUsageReport{}
	ctx = subj.SetNS(ctx, c.ns)
	if err := api2.Call(ctx, c.txCon, messages.APIGetTaskSpecUsage, c.ExpectedCompatibleServerVersion, c.SendMiddleware, req, res); err != nil {
		return nil, c.clientErr(ctx, err)
	}
	return res, nil
}

// CancelProcessInstance cancels a running Process Instance.
func (c *Client) CancelProcessInstance(ctx context.Context, executionID string) error {
	return c.cancelProcessInstanceWithError(ctx, executionID, nil)
}

func (c *Client) cancelProcessInstanceWithError(ctx context.Context, processInstanceID string, wfe *model.Error) error {
	res := &model.CancelProcessInstanceResponse{}
	req := &model.CancelProcessInstanceRequest{
		Id:    processInstanceID,
		State: model.CancellationState_errored,
		Error: wfe,
	}
	ctx = subj.SetNS(ctx, c.ns)
	if err := api2.Call(ctx, c.txCon, messages.APICancelExecution, c.ExpectedCompatibleServerVersion, c.SendMiddleware, req, res); err != nil {
		return c.clientErr(ctx, err)
	}
	return nil
}

// LaunchProcess launches a new workflow instance.
func (c *Client) LaunchProcess(ctx context.Context, processName string, mvars model.Vars) (string, string, error) {
	ev, err := vars.Encode(ctx, mvars)
	if err != nil {
		return "", "", fmt.Errorf("encode variables for launch workflow: %w", err)
	}
	req := &model.LaunchWorkflowRequest{Name: processName, Vars: ev}
	res := &model.LaunchWorkflowResponse{}
	ctx = subj.SetNS(ctx, c.ns)
	if err := api2.Call(ctx, c.txCon, messages.APILaunchProcess, c.ExpectedCompatibleServerVersion, c.SendMiddleware, req, res); err != nil {
		return "", "", c.clientErr(ctx, err)
	}
	return res.InstanceId, res.WorkflowId, nil
}

// ListExecution gets a list of running executions by workflow name.
func (c *Client) ListExecution(ctx context.Context, name string) ([]*model.ListExecutionItem, error) {
	req := &model.ListExecutionRequest{WorkflowName: name}
	res := &model.ListExecutionResponse{}
	ctx = subj.SetNS(ctx, c.ns)
	if err := api2.Call(ctx, c.txCon, messages.APIListExecution, c.ExpectedCompatibleServerVersion, c.SendMiddleware, req, res); err != nil {
		return nil, c.clientErr(ctx, err)
	}
	return res.Result, nil
}

// ListWorkflows gets a list of launchable workflow in SHAR.
func (c *Client) ListWorkflows(ctx context.Context) ([]*model.ListWorkflowResponse, error) {
	req := &model.ListWorkflowsRequest{}
	res := &model.ListWorkflowsResponse{}
	ctx = subj.SetNS(ctx, c.ns)
	if err := api2.Call(ctx, c.txCon, messages.APIListWorkflows, c.ExpectedCompatibleServerVersion, c.SendMiddleware, req, res); err != nil {
		return nil, c.clientErr(ctx, err)
	}
	return res.Result, nil
}

// ListExecutionProcesses lists the current process IDs for an Execution.
func (c *Client) ListExecutionProcesses(ctx context.Context, id string) (*model.ListExecutionProcessesResponse, error) {
	req := &model.ListExecutionProcessesRequest{Id: id}
	res := &model.ListExecutionProcessesResponse{}
	ctx = subj.SetNS(ctx, c.ns)
	if err := api2.Call(ctx, c.txCon, messages.APIListExecutionProcesses, c.ExpectedCompatibleServerVersion, c.SendMiddleware, req, res); err != nil {
		return nil, c.clientErr(ctx, err)
	}
	return res, nil
}

// GetProcessInstanceStatus lists the current workflow states for a process instance.
func (c *Client) GetProcessInstanceStatus(ctx context.Context, id string) (*model.GetProcessInstanceStatusResult, error) {
	req := &model.GetProcessInstanceStatusRequest{Id: id}
	res := &model.GetProcessInstanceStatusResult{}
	ctx = subj.SetNS(ctx, c.ns)
	if err := api2.Call(ctx, c.txCon, messages.APIGetProcessInstanceStatus, c.ExpectedCompatibleServerVersion, c.SendMiddleware, req, res); err != nil {
		return nil, c.clientErr(ctx, err)
	}
	return res, nil
}

// GetUserTask fetches details for a user task based upon an ID obtained from, ListUserTasks
func (c *Client) GetUserTask(ctx context.Context, owner string, trackingID string) (*model.GetUserTaskResponse, model.Vars, error) {
	req := &model.GetUserTaskRequest{Owner: owner, TrackingId: trackingID}
	res := &model.GetUserTaskResponse{}
	ctx = subj.SetNS(ctx, c.ns)
	if err := api2.Call(ctx, c.txCon, messages.APIGetUserTask, c.ExpectedCompatibleServerVersion, c.SendMiddleware, req, res); err != nil {
		return nil, nil, c.clientErr(ctx, err)
	}
	v, err := vars.Decode(ctx, res.Vars)
	if err != nil {
		return nil, nil, c.clientErr(ctx, err)
	}
	return res, v, nil
}

// SendMessage sends a Workflow Message to a specific workflow instance
func (c *Client) SendMessage(ctx context.Context, name string, key any, mvars model.Vars) error {
	var skey string
	switch key.(type) {
	case string:
		skey = "\"" + fmt.Sprintf("%+v", key) + "\""
	default:
		skey = fmt.Sprintf("%+v", key)
	}
	b, err := vars.Encode(ctx, mvars)
	if err != nil {
		return fmt.Errorf("encode variables for send message: %w", err)
	}
	req := &model.SendMessageRequest{Name: name, CorrelationKey: skey, Vars: b}
	res := &model.SendMessageResponse{}
	ctx = subj.SetNS(ctx, c.ns)
	if err := api2.Call(ctx, c.txCon, messages.APISendMessage, c.ExpectedCompatibleServerVersion, c.SendMiddleware, req, res); err != nil {
		return c.clientErr(ctx, err)
	}
	return nil
}

func (c *Client) clientErr(_ context.Context, err error) error {
	return fmt.Errorf("client error: %w", err)
}

// RegisterProcessComplete registers a function to be executed when a shar workflow process terminates.
func (c *Client) RegisterProcessComplete(processId string, fn ProcessTerminateFn) error {
	c.proCompleteTasks[processId] = fn
	return nil
}

// GetProcessHistory gets the history for a process.
func (c *Client) GetProcessHistory(ctx context.Context, processInstanceId string) (*model.GetProcessHistoryResponse, error) {
	req := &model.GetProcessHistoryRequest{Id: processInstanceId}
	res := &model.GetProcessHistoryResponse{}
	ctx = subj.SetNS(ctx, c.ns)
	if err := api2.Call(ctx, c.txCon, messages.APIGetProcessHistory, c.ExpectedCompatibleServerVersion, c.SendMiddleware, req, res); err != nil {
		return nil, c.clientErr(ctx, err)
	}
	return res, nil
}

func (c *Client) clientLog(ctx context.Context, trackingID string, level slog.Level, message string, attrs map[string]string) error {
	k := common.KSuidTo128bit(trackingID)
	req := &model.LogRequest{
		Hostname:   c.host,
		ClientId:   c.id,
		TrackingId: k[:],
		Level:      int32(level),
		Time:       time.Now().UnixMicro(),
		Source:     model.LogSource_logSourceClient,
		Message:    message,
		Attributes: attrs,
	}
	res := &model.LogResponse{}
	ctx = subj.SetNS(ctx, c.ns)
	if err := api2.Call(ctx, c.txCon, messages.APILog, c.ExpectedCompatibleServerVersion, c.SendMiddleware, req, res); err != nil {
		return c.clientErr(ctx, err)
	}
	return nil
}

// GetJob returns a Job given a tracking ID
func (c *Client) GetJob(ctx context.Context, id string) (*model.WorkflowState, error) {
	req := &model.GetJobRequest{JobId: id}
	res := &model.GetJobResponse{}
	ctx = subj.SetNS(ctx, c.ns)
	if err := api2.Call(ctx, c.txCon, messages.APIGetJob, c.ExpectedCompatibleServerVersion, c.SendMiddleware, req, res); err != nil {
		return nil, c.clientErr(ctx, err)
	}
	return res.Job, nil
}

// GetServerVersion returns the current server version
func (c *Client) GetServerVersion(ctx context.Context) (*version.Version, error) {
	req := &model.GetVersionInfoRequest{
		ClientVersion:     c.version.String(),
		CompatibleVersion: c.ExpectedCompatibleServerVersion.String(),
	}
	res := &model.GetVersionInfoResponse{}
	ctx = subj.SetNS(ctx, c.ns)
	if err := api2.Call(ctx, c.con, messages.APIGetVersionInfo, c.ExpectedCompatibleServerVersion, c.SendMiddleware, req, res); err != nil {
		return nil, fmt.Errorf("get version info: %w", err)
	}

	sv, err := version.NewVersion(res.ServerVersion)
	if err != nil {
		return nil, fmt.Errorf("get server version info: %w", err)
	}
	cv, err := version.NewVersion(res.MinCompatibleVersion)
	if err != nil {
		return nil, fmt.Errorf("get server version info: %w", err)
	}
	c.ExpectedServerVersion = sv

	if !res.Connect {
		return sv, fmt.Errorf("incompatible client version: client must be " + cv.String())
	}

	ok, cv2 := upgrader.IsCompatible(cv)
	if !ok {
		return sv, fmt.Errorf("incompatible server version: " + sv.String() + " server must be " + cv2.String())
	}
	return sv, nil
}

func (c *Client) registerServiceTask(ctx context.Context, spec *model.TaskSpec) (string, error) {
	req := &model.RegisterTaskRequest{
		Spec: spec,
	}
	res := &model.RegisterTaskResponse{}
	ctx = subj.SetNS(ctx, c.ns)
	if err := api2.Call(ctx, c.txCon, messages.APIRegisterTask, c.ExpectedCompatibleServerVersion, c.SendMiddleware, req, res); err != nil {
		return "", c.clientErr(ctx, err)
	}
	return res.Uid, nil
}

// GetTaskSpecByUID gets a versioned task spec by its UID
func (c *Client) GetTaskSpecByUID(ctx context.Context, uid string) (*model.TaskSpec, error) {
	req := &model.GetTaskSpecRequest{
		Uid: uid,
	}
	res := &model.GetTaskSpecResponse{}
	ctx = subj.SetNS(ctx, c.ns)
	if err := api2.Call(ctx, c.txCon, messages.APIGetTaskSpec, c.ExpectedCompatibleServerVersion, c.SendMiddleware, req, res); err != nil {
		return nil, c.clientErr(ctx, err)
	}
	return res.Spec, nil
}

// ListTaskSpecs lists active and optionally deprecated task specs.
func (c *Client) ListTaskSpecs(ctx context.Context, includeDeprecated bool) ([]*model.TaskSpec, error) {
	req := &model.ListTaskSpecUIDsRequest{
		IncludeDeprecated: includeDeprecated,
	}
	res := &model.ListTaskSpecUIDsResponse{}
	ctx = subj.SetNS(ctx, c.ns)
	if err := api2.Call(ctx, c.txCon, messages.APIListTaskSpecUIDs, c.ExpectedCompatibleServerVersion, c.SendMiddleware, req, res); err != nil {
		return nil, c.clientErr(ctx, err)
	}

	ret := make([]*model.TaskSpec, 0, len(res.Uid))

	for _, i := range res.Uid {
		ts, err := c.GetTaskSpecByUID(ctx, i)
		if err != nil {
			return nil, fmt.Errorf("list task specs: get task spec '%s': %w", i, err)
		}
		ret = append(ret, ts)
	}
	return ret, nil
}

func (c *Client) heartbeat(ctx context.Context) error {
	req := &model.HeartbeatRequest{
		Host: c.host,
		Id:   c.id,
		Time: time.Now().UnixMilli(),
	}
	res := &model.HeartbeatResponse{}
	ctx = subj.SetNS(ctx, c.ns)
	if err := api2.Call(ctx, c.txCon, messages.APIHeartbeat, c.ExpectedCompatibleServerVersion, c.SendMiddleware, req, res); err != nil {
		return c.clientErr(ctx, err)
	}
	return nil
}

func (c *Client) startHeart(ctx context.Context) error {
	go func() {
		for {
			select {
			case <-c.closer:
				return
			default:

			}
			if err := c.heartbeat(ctx); err != nil {
				slog.Error("heartbeat", "error", err)
			}
			time.Sleep(HeartBeatInterval)
		}
	}()
	return nil
}

// Shutdown stops message processing and waits for processing messages gracefully.
func (c *Client) Shutdown() {
	c.shutdownOnce.Do(func() {
		close(c.closer)
		for {
			c.processingMx.Lock()
			if c.processing == 0 {
				c.processingMx.Unlock()
				return
			}
			c.processingMx.Unlock()
			time.Sleep(500 * time.Millisecond)
		}
	})
}

func (c *Client) listenTerm(ctx context.Context) {
	if !testing.Testing() && !c.noOSSig {
		signal.Notify(c.sig, syscall.SIGTERM, syscall.SIGINT)
		go func() {
			for {
				select {
				case <-c.closer:
					return
				case <-c.sig:
					c.Shutdown()
					os.Exit(0)
				}
			}
		}()
	}
}
