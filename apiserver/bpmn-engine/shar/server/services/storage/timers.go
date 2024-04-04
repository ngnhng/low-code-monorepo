package storage

import (
	"context"
	errors2 "errors"
	"github.com/nats-io/nats.go"
	"gitlab.com/shar-workflow/shar/common"
	"gitlab.com/shar-workflow/shar/common/header"
	"gitlab.com/shar-workflow/shar/common/logx"
	"gitlab.com/shar-workflow/shar/common/subj"
	"gitlab.com/shar-workflow/shar/model"
	"gitlab.com/shar-workflow/shar/server/errors"
	"gitlab.com/shar-workflow/shar/server/messages"
	"google.golang.org/protobuf/proto"
	"log/slog"
	"strconv"
	"strings"
	"time"
)

func (s *Nats) listenForTimer(sCtx context.Context, js nats.JetStreamContext, closer chan struct{}, concurrency int) error {
	log := logx.FromContext(sCtx)
	subject := subj.NS("WORKFLOW.%s.Timers.>", "*")
	durable := "workflowTimers"
	for i := 0; i < concurrency; i++ {
		go func() {

			sub, err := js.PullSubscribe(subject, durable)
			if err != nil {
				log.Error("process pull subscribe error", err, slog.String("subject", subject), slog.String("durable", durable))
				return
			}
			for {
				select {
				case <-closer:
					return
				default:
				}
				reqCtx, cancel := context.WithTimeout(sCtx, 30*time.Second)
				msg, err := sub.Fetch(1, nats.Context(reqCtx))
				if err != nil {
					if errors2.Is(err, context.DeadlineExceeded) {
						cancel()
						continue
					}
					if err.Error() == "nats: Server Shutdown" || err.Error() == "nats: connection closed" {
						cancel()
						continue
					}
					// Log Error
					log.Error("message fetch error", err)
					cancel()
					continue
				}
				m := msg[0]
				//				log.Debug("Process:"+traceName, slog.String("subject", msg[0].Subject))
				cancel()
				embargoA := m.Header.Get("embargo")
				if embargoA == "" {
					embargoA = "0"
				}
				embargo, err := strconv.Atoi(embargoA)
				if err != nil {
					log.Error("bad embargo value", err)
					continue
				}
				if embargo != 0 {
					offset := time.Duration(int64(embargo) - time.Now().UnixNano())
					if offset > 0 {
						if err := m.NakWithDelay(offset); err != nil {
							log.Warn("nak with delay")
						}
						continue
					}
				}

				state := &model.WorkflowState{}
				err = proto.Unmarshal(msg[0].Data, state)
				if err != nil {
					log.Error("unmarshal timer proto: %s", err)
					err := msg[0].Ack()
					if err != nil {
						log.Error("dispose of timer message after unmarshal error: %s", err)
					}
					continue
				}

				var cid string
				if cid = msg[0].Header.Get(logx.CorrelationHeader); cid == "" {
					log.Error("correlation key missing", errors.ErrMissingCorrelation)
					continue
				}

				ctx, log := logx.NatsMessageLoggingEntrypoint(sCtx, "shar-server", msg[0].Header)
				ctx, err = header.FromMsgHeaderToCtx(ctx, m.Header)
				ctx = subj.SetNS(ctx, m.Header.Get(header.SharNamespace))
				if err != nil {
					log.Error("get header values from incoming process message", slog.Any("error", &errors.ErrWorkflowFatal{Err: err}))
					if err := msg[0].Ack(); err != nil {
						log.Error("processing failed to ack", err)
					}
					continue
				}
				if strings.HasSuffix(msg[0].Subject, ".Timers.ElementExecute") {
					_, err := s.hasValidExecution(sCtx, state.ExecutionId)
					if errors2.Is(err, errors.ErrExecutionNotFound) {
						log := logx.FromContext(sCtx)
						log.Log(reqCtx, slog.LevelInfo, "listenForTimer aborted due to a missing instance")
						continue
					} else if err != nil {
						continue
					}

					pi, err := s.GetProcessInstance(ctx, state.ProcessInstanceId)
					if errors2.Is(err, errors.ErrProcessInstanceNotFound) {
						if err := msg[0].Ack(); err != nil {
							log.Error("ack message after process instance not found", err)
							continue
						}
						continue
					}
					wf, err := s.GetWorkflow(ctx, pi.WorkflowId)
					if err != nil {
						log.Error("get workflow", err)
						continue
					}
					activityID := common.TrackingID(state.Id).ID()
					_, err = s.GetOldState(ctx, activityID)
					if errors2.Is(err, errors.ErrStateNotFound) {
						if err := msg[0].Ack(); err != nil {
							log.Error("ack message after state not found", err)
							continue
						}
					}
					if err != nil {
						return
					}
					els := common.ElementTable(wf)
					parent := common.TrackingID(state.Id).Pop()
					if err := s.traversalFunc(ctx, pi, parent, &model.Targets{Target: []*model.Target{{Id: "timer-target", Target: *state.Execute}}}, els, state); err != nil {
						log.Error("traverse", err)
						continue
					}
					if err := s.PublishWorkflowState(ctx, subj.NS(messages.WorkflowActivityAbort, subj.GetNS(ctx)), state); err != nil {
						if err != nil {
							continue
						}
					}

					if err = msg[0].Ack(); err != nil {
						log.Warn("ack after timer redirect", err)
					}
					continue
				}
				ack, delay, err := s.messageProcessor(ctx, state, nil, int64(embargo))
				if err != nil {
					if errors.IsWorkflowFatal(err) {
						if err := msg[0].Ack(); err != nil {
							log.Error("ack after a fatal error in message processing: %s", err)
						}
						log.Error("a fatal error occurred processing a message: %s", err)
						continue
					}
					log.Error("an error occurred processing a message: %s", err)
					continue
				}
				if ack {
					err := msg[0].Ack()
					if err != nil {
						log.Error("ack after message processing: %s", err)
						continue
					}
				} else {
					if delay > 0 {
						err := msg[0].NakWithDelay(time.Duration(delay))
						if err != nil {
							log.Error("nak message with delay: %s", err)
							continue
						}
					} else {
						err := msg[0].Nak()
						if err != nil {
							log.Error("nak message: %s", err)
							continue
						}
					}
				}
			}
		}()
	}
	return nil
}
