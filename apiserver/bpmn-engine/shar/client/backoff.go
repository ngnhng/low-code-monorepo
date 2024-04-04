package client

import (
	"context"
	"errors"
	"fmt"
	"github.com/nats-io/nats.go"
	"gitlab.com/shar-workflow/shar/common"
	"gitlab.com/shar-workflow/shar/common/logx"
	"gitlab.com/shar-workflow/shar/common/workflow"
	api2 "gitlab.com/shar-workflow/shar/internal/client/api"
	"gitlab.com/shar-workflow/shar/model"
	errors2 "gitlab.com/shar-workflow/shar/server/errors"
	"gitlab.com/shar-workflow/shar/server/messages"
	"google.golang.org/protobuf/proto"
	"log/slog"
	"math"
	"strconv"
	"time"
)

func (c *Client) backoff(ctx context.Context, msg *nats.Msg) error {
	state := &model.WorkflowState{}
	if err := proto.Unmarshal(msg.Data, state); err != nil {
		slog.Error("unmarshalling state", err)
		return fmt.Errorf("service task listener: %w", err)
	}

	// Get the metadata including delivery attempts
	meta, err := msg.Metadata()
	if err != nil {
		return fmt.Errorf("fetching message metadata")
	}
	// Get the workflow this task belongs to
	wf, err := c.GetWorkflow(ctx, state.WorkflowId)
	if err != nil {
		if errors.Is(err, errors2.ErrWorkflowNotFound) {
			slog.ErrorContext(ctx, "terminated a task without a workflow", "error", err)
			if err2 := msg.Term(); err2 != nil {
				slog.ErrorContext(ctx, "failed to terminate task without a workflow", "error", err)
			}
		}
		return fmt.Errorf("getting workflow: %w", err)
	}
	// And the service task element
	elem := common.ElementTable(wf)[state.ElementId]

	// and extract the retry behaviour
	retryBehaviour := elem.RetryBehaviour

	// Is this the last time to fail?
	if uint32(meta.NumDelivered) >= retryBehaviour.Number {
		switch retryBehaviour.DefaultExceeded.Action {
		case model.RetryErrorAction_FailWorkflow:
			if err := c.CancelProcessInstance(ctx, state.ExecutionId); err != nil {
				return fmt.Errorf("cancelling workflow instance: %w", err)
			}
			return nil
		case model.RetryErrorAction_ThrowWorkflowError:
			trackingID := common.TrackingID(state.Id).ID()
			res := &model.HandleWorkflowErrorResponse{}
			req := &model.HandleWorkflowErrorRequest{TrackingId: trackingID, ErrorCode: retryBehaviour.DefaultExceeded.ErrorCode, Vars: []byte{}}
			if err2 := api2.Call(ctx, c.txCon, messages.APIHandleWorkflowError, c.ExpectedCompatibleServerVersion, c.SendMiddleware, req, res); err2 != nil {
				// TODO: This isn't right.  If this call fails it assumes it is handled!
				reterr := fmt.Errorf("retry workflow error handle: %w", err2)
				return logx.Err(ctx, "call workflow error handler", reterr, slog.Any("workflowError", &workflow.Error{Code: retryBehaviour.DefaultExceeded.ErrorCode, WrappedError: err2}))
			}
			if !res.Handled {
				return fmt.Errorf("handle workflow error with code %s", retryBehaviour.DefaultExceeded.ErrorCode)
			}
			return nil
		case model.RetryErrorAction_PauseWorkflow:
		case model.RetryErrorAction_SetVariableValue:
			trackingID := common.TrackingID(state.Id).ID()
			var retVar any
			switch retryBehaviour.DefaultExceeded.VariableType {
			case "int":
				retVar, err = strconv.ParseInt(retryBehaviour.DefaultExceeded.VariableValue, 10, 64)
				if err != nil {
					retVar = err.Error()
				}
			case "float":
				retVar, err = strconv.ParseFloat(retryBehaviour.DefaultExceeded.VariableValue, 64)
				if err != nil {
					retVar = err.Error()
				}
			case "bool":
				retVar, err = strconv.ParseBool(retryBehaviour.DefaultExceeded.VariableValue)
				if err != nil {
					retVar = err.Error()
				}
			default: // string
				retVar = retryBehaviour.DefaultExceeded.VariableValue
			}
			if err := c.completeServiceTask(ctx, trackingID, model.Vars{retryBehaviour.DefaultExceeded.Variable: retVar}); err != nil {
				return fmt.Errorf("completing service task with error variable: %w", err)
			}
		}
		// Kill the message
		if err := msg.Term(); err != nil {
			return fmt.Errorf("terminating message delivery: %w", err)
		}
	}
	var offset time.Duration
	messageTime := time.Unix(0, state.UnixTimeNano)
	offset = time.Duration(retryBehaviour.InitMilli)
	if meta.NumDelivered > 1 {
		if retryBehaviour.Strategy == model.RetryStrategy_Incremental {
			offset += time.Millisecond * time.Duration(retryBehaviour.IntervalMilli*(int64(meta.NumDelivered)-1))
		} else {
			incrementMultiplier := int64(math.Pow(2, float64(meta.NumDelivered)))
			offset += time.Millisecond*time.Duration(retryBehaviour.InitMilli) + (time.Millisecond * time.Duration(retryBehaviour.IntervalMilli*incrementMultiplier))
		}
		if int64(offset) > retryBehaviour.MaxMilli*int64(time.Millisecond) {
			offset = time.Duration(retryBehaviour.MaxMilli * int64(time.Millisecond))
		}
	}
	if time.Since(messageTime)-offset < 0 {
		offset = 0
	}

	if err := msg.NakWithDelay(offset); err != nil {
		return fmt.Errorf("linear backoff: %w", err)
	}
	return nil
}
