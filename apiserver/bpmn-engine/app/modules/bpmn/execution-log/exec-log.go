// Package executionlog contains the NATS client and log to fetch the execution log of a process instance
package executionlog

import (
	"context"
	"regexp"
	"strings"
	"yalc/bpmn-engine/domain/workflow"
	"yalc/bpmn-engine/modules/config"
	"yalc/bpmn-engine/modules/logger"

	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/jetstream"

	"go.uber.org/fx"
)

const (
	STREAM                      = "WORKFLOW"
	ServiceTaskStartedSubject   = "WORKFLOW.default.State.Job.Execute.ServiceTask"
	ServiceTaskCompletedSubject = "WORKFLOW.default.State.Job.Complete.ServiceTask"
	UserTaskStartedSubject      = "WORKFLOW.default.State.Job.Execute.UserTask"
	UserTaskCompletedSubject    = "WORKFLOW.default.State.Job.Complete.UserTask"
	ExecutionCompleted          = "WORKFLOW.default.State.Execution.Complete"
)

type (
	ExecutionLogger struct {
		natsConn          *nats.Conn
		Config            config.Config
		Logger            logger.Logger
		JetStream         jetstream.JetStream
		JobConsumer       jetstream.Consumer
		ExecutionConsumer jetstream.Consumer
	}

	Params struct {
		fx.In

		Config config.Config
		Logger logger.Logger
	}
)

func NewExecutionLogger(p Params) (*ExecutionLogger, error) {
	ctx := context.Background()

	conn, err := nats.Connect(p.Config.GetConfig().NatsURL)
	if err != nil {
		return nil, err
	}

	js, err := jetstream.New(conn)
	if err != nil {
		return nil, err
	}

	// create a consumer to read the logs
	jobConsumer, err := js.CreateConsumer(ctx, STREAM, jetstream.ConsumerConfig{
		Durable:       "CONS",
		DeliverPolicy: jetstream.DeliverAllPolicy,
		FilterSubject: "WORKFLOW.*.State.Job.*.>",
		AckPolicy:     jetstream.AckExplicitPolicy,
	})

	if err != nil {
		return nil, err
	}

	executionConsumer, err := js.CreateConsumer(ctx, STREAM, jetstream.ConsumerConfig{
		Durable:       "EXECUTION_CONS",
		DeliverPolicy: jetstream.DeliverAllPolicy,
		FilterSubject: "WORKFLOW.*.State.Execution.*",
		AckPolicy:     jetstream.AckExplicitPolicy,
	})
	if err != nil {
		return nil, err
	}

	return &ExecutionLogger{
		natsConn:          conn,
		Config:            p.Config,
		Logger:            p.Logger,
		JetStream:         js,
		JobConsumer:       jobConsumer,
		ExecutionConsumer: executionConsumer,
	}, nil
}

func (el *ExecutionLogger) Close() {
	el.natsConn.Close()
}

// GetServiceTaskLogById fetches the log of a service task execution
// It looks for the project id in the message payload and returns the logs
func (el *ExecutionLogger) GetServiceTaskLogById(ctx context.Context, id string, logCh chan workflow.TaskLog, errCh chan error) {
	//logs := make([]workflow.TaskLog, 0)
	finish := make(chan struct{})
	defer close(finish)
	defer close(logCh)
	defer close(errCh)

	searchId := id[1:]

	handler := func(msg jetstream.Msg) {
		el.Logger.Debug("Received message: \n", logger.Fields{
			"subject": msg.Subject(),
			//"payload": string(msg.Data()),
		})

		subject := msg.Subject()

		// search the stream based on the id and subject
		// get messages of the subject

		switch {
		case strings.Contains(subject, ServiceTaskStartedSubject),
			strings.Contains(subject, ServiceTaskCompletedSubject),
			strings.Contains(subject, UserTaskStartedSubject),
			strings.Contains(subject, UserTaskCompletedSubject),
			strings.Contains(subject, ExecutionCompleted):
			el.handleMsg(msg, searchId, logCh)
		}
	}

	// get the stream and search for the log
	el.Logger.Debug("Consuming logs")
	jobConsumeCtx, err := el.JobConsumer.Consume(handler)
	if err != nil {
		el.Logger.Error("Error consuming logs", err)
		errCh <- err
		finish <- struct{}{}
	}
	defer jobConsumeCtx.Stop()

	executionConsumeCtx, err := el.ExecutionConsumer.Consume(handler)
	if err != nil {
		el.Logger.Error("Error consuming logs", err)
		errCh <- err
		finish <- struct{}{}
	}
	defer executionConsumeCtx.Stop()

	//ticker := time.NewTicker(10 * time.Second)
	//defer ticker.Stop()

	select {
	case <-finish:
		el.Logger.Info("Finished consuming logs")
		return
	case <-ctx.Done():
		el.Logger.Info("Context done consuming logs")
		return
		//case <-ticker.C:
		//	if err = ctx.Err(); err != nil {
		//		el.Logger.Info("Context done consuming logs")
		//		return
		//	}
	}
}

func (el *ExecutionLogger) handleMsg(msg jetstream.Msg, searchId string, logCh chan workflow.TaskLog) {
	el.Logger.Debug("Received log for service task: \n", logger.Fields{
		"subject": msg.Subject(),
	})

	data := string(msg.Data())
	if !strings.Contains(string(msg.Data()), searchId) {
		return
	}

	el.Logger.Debug("Found log for service task: \n", logger.Fields{
		"subject": msg.Subject(),
		"payload": string(msg.Data()),
	})

	meta, err := msg.Metadata()
	if err != nil {
		el.Logger.Error("Error getting metadata: ", err)
		return
	}

	taskIdPattern := regexp.MustCompile(`(Activity|Event)_[a-zA-Z0-9]{7}`)
	matches := taskIdPattern.FindStringSubmatch(string(msg.Data()))
	if len(matches) == 0 {
		el.Logger.Error("Error getting task id")
		matches = []string{"unknown"}
	}

	trackingId := extractTrackingId(data)

	el.Logger.Debug("Sending: ", matches[0])
	logCh <- workflow.TaskLog{
		Id:       matches[0],
		Subject:  msg.Subject(),
		Received: meta.Timestamp,
		Payload:  trackingId,
	}
}

func extractTrackingId(data string) string {
	if strings.Contains(data, ":") {
		trackingId := strings.Split(data, ":")[0]
		trackingId = strings.Split(trackingId, "*")[len(strings.Split(trackingId, "*"))-1]
		return trackingId
	}
	return "unknown"
}
