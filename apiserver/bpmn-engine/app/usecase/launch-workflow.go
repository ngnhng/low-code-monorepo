package usecase

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"time"
	"yalc/bpmn-engine/domain"
	"yalc/bpmn-engine/domain/workflow"

	"yalc/bpmn-engine/modules/bpmn"
	"yalc/bpmn-engine/modules/logger"

	"github.com/golang-jwt/jwt/v5"
	"go.uber.org/fx"
)

type (
	LaunchWorkflowUseCase interface {
		Execute(context.Context, *workflow.WorkflowLaunchRequest) (*workflow.LaunchStatus, error)
	}

	launchWorkflowUseCase struct {
		logger       logger.Logger
		engineClient *bpmn.SharClient
		errorChan    chan error
	}

	LaunchWorkflowUseCaseParams struct {
		fx.In

		logger.Logger
		*bpmn.SharClient
	}
)

func NewLaunchWorkflowUseCase(p LaunchWorkflowUseCaseParams) LaunchWorkflowUseCase {
	return &launchWorkflowUseCase{
		logger:       p.Logger,
		engineClient: p.SharClient,
		errorChan:    make(chan error),
	}
}

func (uc *launchWorkflowUseCase) Execute(ctx context.Context, request *workflow.WorkflowLaunchRequest) (*workflow.LaunchStatus, error) {
	timerCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	uc.logger.Debug("Starting workflow launch use case")

	decodedBPMN, err := base64.StdEncoding.DecodeString(request.ProcessDefinition)
	if err != nil {
		uc.logger.Debugf("Error while decoding BPMN: %v", err)
		return nil, err
	}
	decodedMapping, err := base64.StdEncoding.DecodeString(request.VariableMapping)
	if err != nil {
		uc.logger.Debugf("Error while decoding variable mapping: %v", err)
		return nil, err
	}

	// load the bpmn definition
	// execution context
	// TODO: crash loop if context in cancelled while executing
	execCtx := context.Background()
	if err := uc.engineClient.LoadBPMN(execCtx, request.WorkflowID, decodedBPMN); err != nil {
		uc.logger.Error("Error while loading BPMN: ", err)
		return nil, err
	}

	// start the process instance

	// create channels to handle errors and process instance start
	startedChan := make(chan struct{})
	launchStatus := &workflow.LaunchStatus{}

	go func(launch *workflow.LaunchStatus) {
		var varMap map[string]interface{} = make(map[string]interface{})
		err = json.Unmarshal(decodedMapping, &varMap)
		if err != nil {
			uc.logger.Error("Error while unmarshalling variable mapping: ", err)
			uc.errorChan <- err
		}

		uc.logger.Debug("varMap: ", varMap)

		// create user-specific var mapping from context
		user, ok := ctx.Value(domain.UserKey).(*jwt.Token)
		if !ok || user == nil {
			uc.logger.Error("Error while getting user from context")
			uc.errorChan <- err
			return
		}

		uc.logger.Debug("User: ", user)
		varMap["_globalContext_user"] = user.Claims.(jwt.MapClaims)["email"]

		uc.logger.Debug("varMap: ", varMap)

		instanceId, wfId, err := uc.engineClient.StartProcessInstance(execCtx, request.WorkflowID, varMap)
		if err != nil {
			uc.logger.Error("Error while starting process instance: ", err)
			uc.errorChan <- err
		}

		launch.ProcessInstanceID = instanceId
		launch.WorkflowID = wfId
		startedChan <- struct{}{}

	}(launchStatus)

	// listen for workflow status
	go func() {
		uc.engineClient.Listen(execCtx)
		err := <-uc.errorChan
		if err != nil {
			uc.logger.Error("Error while listening for workflow status: ", err)
			cancelErr := uc.engineClient.CancelProcessInstance(execCtx, launchStatus.ProcessInstanceID)
			if cancelErr != nil {
				uc.logger.Error("Error while cancelling process instance: ", cancelErr)
			}
		}
	}()

	// listen for errors and process instance start
	select {
	case err := <-uc.errorChan:
		uc.logger.Debug("Error while starting process instance: ", err)
		return nil, err
	case <-startedChan:
		uc.logger.Debug("Process instance started")
		return launchStatus, nil
	case <-timerCtx.Done():
		uc.logger.Debug("Timeout while starting process instance")
		return nil, timerCtx.Err()
	}
}
