package bpmn

import (
	"context"
	"yalc/bpmn-engine/modules/config"
	"yalc/bpmn-engine/modules/logger"

	"gitlab.com/shar-workflow/shar/client"
)

//type (
//	EngineClient interface {
//		// Connect connects to the message broker
//		Connect() error
//		// Close closes the connection to the message broker
//		Close() error
//		// LoadBPMN loads the bpmn definition
//		LoadBPMN(ctx context.Context, bpmnID string, bpmnDef []byte) error
//		// StartProcessInstance starts a process instance
//		StartProcessInstance(ctx context.Context, processID string, vars map[string]interface{}) (string, string, error)
//		// CancelProcessInstance cancels a process instance
//		CancelProcessInstance(ctx context.Context, processID string) error
//		// Listen listens for workflow status
//		Listen(context.Context, ...chan error)
//	}
//)

//var _ EngineClient = &sharClient{}

type (
	SharClient struct {
		connCtx context.Context
		client  *client.Client
		config  config.Config
		logger  logger.Logger

		errorChan chan error
	}
)
