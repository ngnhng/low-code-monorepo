package bpmn

import (
	"context"
	"fmt"
	"yalc/bpmn-engine/modules/config"
	"yalc/bpmn-engine/modules/logger"

	"gitlab.com/shar-workflow/shar/client"
	"gitlab.com/shar-workflow/shar/client/taskutil"
	"gitlab.com/shar-workflow/shar/model"
	"go.uber.org/fx"
)

type (
	Params struct {
		fx.In

		Config config.Config
		Logger logger.Logger
	}
	//SharClient struct {
	//	connCtx context.Context
	//	client  *client.Client
	//	config  config.Config
	//	logger  logger.Logger

	//	errorChan chan error
	//}
)

func NewSharClient(p Params) *SharClient {
	cl := &SharClient{
		connCtx: context.Background(),
		client:  client.New(),
		config:  p.Config,
		logger:  p.Logger,

		errorChan: make(chan error),
	}

	go func() { cl.errorChanHandler() }()

	return cl
}

func (s *SharClient) GetConnCtx() context.Context {
	return s.connCtx
}

func (s *SharClient) GetClient() *client.Client {
	return s.client
}

func (s *SharClient) Connect() (err error) {

	err = s.client.Dial(s.connCtx, s.config.GetConfig().NatsURL)
	if err != nil {
		return err
	}

	//if err = s.loadServiceFunctions(); err != nil {
	//	return err
	//}

	return err
}

func (s *SharClient) Close() error {
	s.Shutdown()
	return nil
}

// LoadBPMN loads the bpmn definition
func (s *SharClient) LoadBPMN(ctx context.Context, bpmnID string, bpmnDef []byte) error {
	_, err := s.client.LoadBPMNWorkflowFromBytes(ctx, bpmnID, bpmnDef)
	return err
}

// StartProcessInstance starts a process instance and returns the process instance id and the process execution id
// The task specification is registered with the shar client before the process instance is started
// Variable mapping is done using the vars map
func (s *SharClient) StartProcessInstance(ctx context.Context, processID string, vars map[string]interface{}) (string, string, error) {
	return s.client.LaunchProcess(ctx, processID, vars)
}

// CancelProcessInstance cancels a process instance
func (s *SharClient) CancelProcessInstance(ctx context.Context, processID string) error {
	return s.client.CancelProcessInstance(ctx, processID)
}

// RegisterTaskSpecification registers a task specification
func (s *SharClient) RegisterTaskSpecification(ctx context.Context, path string, f client.ServiceFn) error {
	return taskutil.RegisterTaskYamlFile(ctx, s.client, path, f)
}

func (s *SharClient) Shutdown() {
	s.client.Shutdown()
}

func (s *SharClient) Listen(ctx context.Context, extraErrorChan ...chan error) {
	// spawn a goroutine to listen
	go func() {
		if err := s.client.Listen(ctx); err != nil {
			s.errorChan <- err
			for _, ch := range extraErrorChan {
				ch <- err
			}
		}
	}()
}

func (s *SharClient) errorChanHandler() {
	err := <-s.errorChan
	s.logger.Error(err)
}

func (s *SharClient) LoadServiceTaskSpecFromFile(ctx context.Context, path string, f client.ServiceFn) error {
	return taskutil.RegisterTaskYamlFile(ctx, s.client, path, f)
}

func (s *SharClient) LoadServiceTaskSpec(ctx context.Context, taskYaml []byte, f client.ServiceFn) error {
	return taskutil.RegisterTaskYaml(ctx, s.client, taskYaml, f)
}

//func (s *SharClient) loadServiceFunctions() error {
//	// load all the service functions
//	// load the service task specification
//	rootDir, err := os.Getwd()

//	if err == nil {
//		err = s.loadServiceTaskSpec(
//			s.connCtx,
//			filepath.Join(rootDir, "service-tasks/google-sheet.task.yaml"),
//			googleSheetFn,
//		)
//	}

//	if err != nil {
//		return err
//	}

//	return nil
//}

func onProcessEnd(_ context.Context, vars model.Vars, wfError *model.Error, state model.CancellationState) {
	fmt.Printf("Vars: %v\n", vars)
}

func TestLogServiceFn(ctx context.Context, cl client.JobClient, vars model.Vars) (model.Vars, error) {
	fmt.Println("Test log service function")
	fmt.Println("Context: ", ctx)
	fmt.Printf("Vars: %v\n", vars)
	return vars, nil
}
