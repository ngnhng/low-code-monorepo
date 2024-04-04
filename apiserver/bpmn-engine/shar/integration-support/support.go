package integration_support

import (
	"context"
	"errors"
	"fmt"
	"github.com/nats-io/nats.go"
	"gitlab.com/shar-workflow/shar/common"
	ns "gitlab.com/shar-workflow/shar/common/namespace"
	"gitlab.com/shar-workflow/shar/server/messages"
	"gitlab.com/shar-workflow/shar/telemetry/config"
	"os"
	"path/filepath"
	"reflect"
	"strconv"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/davecgh/go-spew/spew"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gitlab.com/shar-workflow/shar/common/authn"
	"gitlab.com/shar-workflow/shar/common/authz"
	"gitlab.com/shar-workflow/shar/common/logx"
	"gitlab.com/shar-workflow/shar/model"
	"gitlab.com/shar-workflow/shar/server/tools/tracer"
	server2 "gitlab.com/shar-workflow/shar/telemetry/server"
	zensvr "gitlab.com/shar-workflow/shar/zen-shar/server"
	"google.golang.org/protobuf/proto"
	"log/slog"
)

const (
	// NATS_SERVER_IMAGE_URL_ENV_VAR_NAME is the name of the env var containing the nats image URL
	NATS_SERVER_IMAGE_URL_ENV_VAR_NAME = "NATS_SERVER_IMAGE_URL"
	// SHAR_SERVER_IMAGE_URL_ENV_VAR_NAME is the name of the env var containing the shar server image URL
	SHAR_SERVER_IMAGE_URL_ENV_VAR_NAME = "SHAR_SERVER_IMAGE_URL"
	// NATS_PERSIST_ENV_VAR_NAME is the name of the env var containing the flag determining whether nats data is persisted between tests
	NATS_PERSIST_ENV_VAR_NAME = "NATS_PERSIST"
)

var errDirtyKV = errors.New("KV contains values when expected empty")

// Integration - the integration test support framework.
type Integration struct {
	testNatsServer                zensvr.Server
	testSharServer                zensvr.Server
	FinalVars                     map[string]interface{}
	Mx                            sync.Mutex
	Cooldown                      time.Duration
	WithTelemetry                 server2.Exporter
	testTelemetry                 *server2.Server
	WithTrace                     bool
	traceSub                      *tracer.OpenTrace
	NatsURL                       string // NatsURL is the default testing URL for the NATS host.
	TestRunnable                  func() (bool, string)
	testableUnitName              string
	setupContainerServersFailedFn func(string)
	telemtryFailedHandlerFn       func(error)
	authZFn                       authz.APIFunc
	authNFn                       authn.Check
}

// NewIntegrationT is used to construct an instance of Integration support used from the context of a test
func NewIntegrationT(t *testing.T, authZFn authz.APIFunc, authNFn authn.Check, trace bool, testRunnableFn func() (bool, string), WithTelemetry server2.Exporter) *Integration {
	i := &Integration{}
	i.authZFn = authZFn
	i.authNFn = authNFn
	i.WithTrace = trace
	i.TestRunnable = testRunnableFn
	i.WithTelemetry = WithTelemetry

	i.testableUnitName = t.Name()
	i.setupContainerServersFailedFn = func(failureMessage string) {
		t.Skip(failureMessage)
	}

	i.telemtryFailedHandlerFn = func(err error) {
		require.NoError(t, err)
	}

	return i
}

// NewIntegration is used to construct an instance of Integration support used from the context of a package
func NewIntegration(trace bool, packageName string, WithTelemetry server2.Exporter) *Integration {
	i := &Integration{}
	i.WithTrace = trace
	i.WithTelemetry = WithTelemetry

	i.testableUnitName = packageName
	i.setupContainerServersFailedFn = func(failureMessage string) {
		panic("unable to start containerised integration test support: " + failureMessage)
	}

	i.telemtryFailedHandlerFn = func(err error) {
		panic("unable to initialise telemetry: " + err.Error())
	}

	return i
}

// Setup - sets up the test NATS and SHAR servers.
func (s *Integration) Setup() {
	//t.Setenv(NATS_SERVER_IMAGE_URL_ENV_VAR_NAME, "nats:2.9.20")
	//t.Setenv(SHAR_SERVER_IMAGE_URL_ENV_VAR_NAME, "local/shar-server:0.0.1-SNAPSHOT")
	//t.Setenv(NATS_PERSIST_ENV_VAR_NAME, "true")

	if s.TestRunnable != nil {
		runnable, skipReason := s.TestRunnable()
		if !runnable {
			s.setupContainerServersFailedFn(fmt.Sprintf("test skipped reason: %s", skipReason))
		}
	}

	if IsSharContainerised() && !IsNatsContainerised() {
		s.setupContainerServersFailedFn("invalid shar/nats server container/in process combination")
		//the combo of in container shar/in process nats will lead to problems as
		//in container shar will persist nats data to disk - an issue if subsequent tests
		//try to run against a nats instance that has previously written state to disk
		//This might cause issues as data from different tests might interfere with each other
	}

	if IsNatsPersist() && !IsNatsContainerised() {
		s.setupContainerServersFailedFn("NATS_PERSIST only usable with containerised nats")
	}
	s.FinalVars = make(map[string]interface{})

	zensvrOptions := []zensvr.ZenSharOptionApplyFn{zensvr.WithSharServerImageUrl(os.Getenv(SHAR_SERVER_IMAGE_URL_ENV_VAR_NAME)), zensvr.WithNatsServerImageUrl(os.Getenv(NATS_SERVER_IMAGE_URL_ENV_VAR_NAME))}

	if IsNatsPersist() {
		natsStateDirForTest := s.natsStateDirForTestableUnit(s.testableUnitName)
		zensvrOptions = append(zensvrOptions, zensvr.WithNatsPersistHostPath(natsStateDirForTest))
	}

	//zensvrOptions = append(zensvrOptions,zensvr.WithSharServerTelemetry("console"))
	ss, ns, err := zensvr.GetServers(20, s.authZFn, s.authNFn, zensvrOptions...)

	level := slog.LevelDebug

	addSource := true
	textHandler := common.NewTextHandler(level, addSource)

	//conn, err := nats.Connect(ns.GetEndPoint())
	//if err != nil {
	//	panic(err)
	//}
	//sharHandler := common.NewSharHandler(common.HandlerOptions{Level: level}, &common.NatsLogPublisher{
	//	Conn: conn,
	//})

	multiHandler := common.NewMultiHandler([]slog.Handler{textHandler /*sharHandler*/})

	logx.SetDefault("shar-Integration-tests", multiHandler)

	s.NatsURL = fmt.Sprintf("nats://%s", ns.GetEndPoint())

	if err != nil {
		panic(err)
	}
	if s.WithTrace {
		s.traceSub = tracer.Trace(s.NatsURL)
	}

	if s.WithTelemetry != nil {
		ctx := context.Background()
		n, err := nats.Connect(s.NatsURL)
		s.telemtryFailedHandlerFn(err)
		js, err := n.JetStream()
		s.telemtryFailedHandlerFn(err)
		cfg, err := config.GetEnvironment()
		s.telemtryFailedHandlerFn(err)

		_, err = server2.SetupMetrics(ctx, cfg, "shar-telemetry-processor-integration-test")
		if err != nil {
			slog.Error("###failed to init metrics", "err", err.Error())
		}

		s.testTelemetry = server2.New(ctx, n, js, nats.MemoryStorage, s.WithTelemetry)

		err = s.testTelemetry.Listen()
		s.telemtryFailedHandlerFn(err)
	}

	s.testSharServer = ss
	s.testNatsServer = ns

	fmt.Printf("Starting test support for " + s.testableUnitName + "\n")
	fmt.Printf("\033[1;36m%s\033[0m", "> Setup completed\n")
}

func (s *Integration) natsStateDirForTestableUnit(name string) string {
	natsPersistHostRootForTest := fmt.Sprintf("%snats-store/%s/", os.Getenv("TMPDIR"), name)
	slog.Info(fmt.Sprintf("### natsPersistHostRootForTest is %s ", natsPersistHostRootForTest))

	//dir name is the dir creation time epoch millis, sorted asc, if it exists
	dataDirectories, err := os.ReadDir(natsPersistHostRootForTest)
	if err != nil {
		if os.IsNotExist(err) {
			dataDirectories = make([]os.DirEntry, 0)
		} else {
			panic(err)
		}
	}

	now := time.Now()
	oneHourAgo := now.Add(-(time.Second * 3600))
	windowStartEpochMillis := oneHourAgo.UnixMilli()
	var latestDir int64
	var keepLatest bool

	if len(dataDirectories) > 0 {
		latestCreationTimeEpochMillis, err := strconv.ParseInt(dataDirectories[len(dataDirectories)-1].Name(), 10, 64)
		if err != nil {
			panic(err)
		}
		if latestCreationTimeEpochMillis > windowStartEpochMillis {
			latestDir = latestCreationTimeEpochMillis
			keepLatest = true
		}
	}

	if latestDir == 0 { //there are no prior data dirs, need to create one
		latestDir = now.UnixMilli()
	}

	natsStateDirForTest := fmt.Sprintf("%s%d/", natsPersistHostRootForTest, latestDir)
	if err := os.MkdirAll(filepath.Dir(natsStateDirForTest), 0777); err != nil {
		panic(fmt.Errorf("failed creating nats state dir: %w", err))
	}

	purgeOld(natsPersistHostRootForTest, dataDirectories, keepLatest)
	return natsStateDirForTest
}

func purgeOld(natsPersistHostRootForTest string, dataDirectories []os.DirEntry, keepLatest bool) {
	for i, dataDir := range dataDirectories {
		isLatest := i == (len(dataDirectories) - 1)
		if !isLatest || isLatest && !keepLatest {
			err := os.RemoveAll(fmt.Sprintf("%s%s", natsPersistHostRootForTest, dataDir.Name()))
			if err != nil {
				slog.Error(fmt.Sprintf("error while deleting data dir %s%s", natsPersistHostRootForTest, dataDir.Name()))
			}
		}
	}
}

// AssertCleanKV - ensures SHAR has cleans up after itself, and there are no records left in the KV.
func (s *Integration) AssertCleanKV(namespce string, t *testing.T, cooldown time.Duration) {
	ctx, cancel := context.WithCancel(context.Background())
	errs := make(chan error, 1)
	var err error
	go func(ctx context.Context, cancel context.CancelFunc) {
		for {
			if ctx.Err() != nil {
				cancel()
				return
			}
			err = s.checkCleanKVFor(namespce, t)
			if err == nil {
				cancel()
				close(errs)
				return
			}
			if errors.Is(err, errDirtyKV) {
				time.Sleep(500 * time.Millisecond)
				continue
			}
			errs <- err
			cancel()
			return
		}
	}(ctx, cancel)

	select {
	case err2 := <-errs:
		cancel()
		assert.NoError(t, err2, "KV not clean")
		return
	case <-time.After(cooldown):
		cancel()
		if err != nil {
			assert.NoErrorf(t, err, "KV not clean")
		}
		return
	}
}

func (s *Integration) checkCleanKVFor(namespace string, t *testing.T) error {
	js, err := s.GetJetstream()
	require.NoError(t, err)

	for n := range js.KeyValueStores() {

		name := n.Bucket()
		if !strings.HasPrefix(name, namespace) {
			continue
		}

		kvs, err := js.KeyValue(name)
		require.NoError(t, err)
		keys, err := kvs.Keys()
		if err != nil && errors.Is(err, nats.ErrNoKeysFound) {
			continue
		}
		require.NoError(t, err)
		switch name {
		case ns.PrefixWith(namespace, messages.KvDefinition),
			ns.PrefixWith(namespace, messages.KvWfName),
			ns.PrefixWith(namespace, messages.KvJob),
			ns.PrefixWith(namespace, messages.KvInstance),
			ns.PrefixWith(namespace, messages.KvProcessInstance),
			ns.PrefixWith(namespace, messages.KvVersion),
			ns.PrefixWith(namespace, messages.KvClientTaskID),
			ns.PrefixWith(namespace, "WORKFLOW_MSGID"),
			ns.PrefixWith(namespace, "WORKFLOW_MSGNAME"),
			ns.PrefixWith(namespace, messages.KvOwnerName),
			ns.PrefixWith(namespace, messages.KvOwnerID),
			ns.PrefixWith(namespace, messages.KvUserTask),
			ns.PrefixWith(namespace, messages.KvMessageTypes),
			ns.PrefixWith(namespace, messages.KvHistory),
			ns.PrefixWith(namespace, messages.KvTaskSpec),
			ns.PrefixWith(namespace, messages.KvTaskSpecVersions),
			ns.PrefixWith(namespace, messages.KvProcess),
			ns.PrefixWith(namespace, messages.KvClients):
			//noop
		default:
			if len(keys) > 0 {
				sc := spew.ConfigState{
					Indent:                  "\t",
					MaxDepth:                2,
					DisableMethods:          true,
					DisablePointerMethods:   true,
					DisablePointerAddresses: true,
					DisableCapacities:       true,
					ContinueOnMethod:        false,
					SortKeys:                false,
					SpewKeys:                true,
				}

				for _, i := range keys {
					p, err := kvs.Get(i)
					if err == nil {
						str := &model.WorkflowState{}
						err := proto.Unmarshal(p.Value(), str)
						if err == nil {
							fmt.Println(kvs.Bucket())
							sc.Dump(str)
						} else {
							str := &model.MessageInstance{}
							err := proto.Unmarshal(p.Value(), str)
							if err == nil {
								fmt.Println(kvs.Bucket())
								sc.Dump(str)
							}
						}
					}
				}
				return fmt.Errorf("%d unexpected keys found in %s: %w", len(keys), name, errDirtyKV)
			}
		}
	}

	b, err := js.KeyValue(ns.PrefixWith(namespace, "WORKFLOW_USERTASK"))
	if err != nil && errors.Is(err, nats.ErrNoKeysFound) {
		return nil
	}
	if err != nil {
		return fmt.Errorf("checkCleanKV failed to get usertasks: %w", err)
	}

	keys, err := b.Keys()
	if err != nil {
		if errors.Is(err, nats.ErrNoKeysFound) {
			return nil
		}
		return fmt.Errorf("checkCleanKV failed to get user task keys: %w", err)
	}

	for _, k := range keys {
		bts, err := b.Get(k)
		if err != nil {
			return fmt.Errorf("checkCleanKV failed to get user task value: %w", err)
		}
		msg := &model.UserTasks{}
		err = proto.Unmarshal(bts.Value(), msg)
		if err != nil {
			return fmt.Errorf("checkCleanKV failed to unmarshal user task: %w", err)
		}
		if len(msg.Id) > 0 {
			return fmt.Errorf("unexpected UserTask %s found in WORKFLOW_USERTASK: %w", msg.Id, errDirtyKV)
		}
	}

	return nil
}

// Teardown - resposible for shutting down the integration test framework.
func (s *Integration) Teardown() {
	if s.WithTrace {
		s.traceSub.Close()
	}
	fmt.Println("TEARDOWN")
	s.testSharServer.Shutdown()
	s.testNatsServer.Shutdown()
	fmt.Println("NATS shut down")
	fmt.Printf("\033[1;36m%s\033[0m", "> Teardown completed\n")
	fmt.Printf("\n")
}

// GetJetstream - fetches the test framework jetstream server for making test calls.
//
//goland:noinspection GoUnnecessarilyExportedIdentifiers
func (s *Integration) GetJetstream() (nats.JetStreamContext, error) { //nolint:ireturn
	con, err := s.GetNats()
	if err != nil {
		return nil, fmt.Errorf("get NATS: %w", err)
	}
	js, err := con.JetStream()
	if err != nil {
		return nil, fmt.Errorf("obtain JetStream connection: %w", err)
	}
	return js, nil
}

// GetNats - fetches the test framework NATS server for making test calls.
//
//goland:noinspection GoUnnecessarilyExportedIdentifiers
func (s *Integration) GetNats() (*nats.Conn, error) {
	con, err := nats.Connect(s.NatsURL)
	if err != nil {
		return nil, fmt.Errorf("connect to NATS: %w", err)
	}
	return con, nil
}

// WaitForChan waits for a chan struct{} with a duration timeout.
func WaitForChan(t *testing.T, c chan struct{}, d time.Duration) {
	select {
	case <-c:
		return
	case <-time.After(d):
		assert.Fail(t, "timed out waiting for completion")
		return
	}
}

// WaitForExpectedCompletions will wait up to timeout for expectedCompletions on the completion channel
func WaitForExpectedCompletions(t *testing.T, expectedCompletions int, completion chan struct{}, timeout time.Duration) {
	var c int
	for i := 0; i < expectedCompletions; i++ {
		select {
		case <-completion:
			c = c + 1
			if c == expectedCompletions-1 {
				return
			} else {
				continue
			}
		case <-time.After(timeout):
			assert.Fail(t, fmt.Sprintf("###timed out waiting for completion. Expected %d, got %d", expectedCompletions, c))
			return
		}
	}
}

// IsSharContainerised determines whether tests are running against containerised shar server
func IsSharContainerised() bool {
	return os.Getenv(SHAR_SERVER_IMAGE_URL_ENV_VAR_NAME) != ""
}

// IsNatsContainerised determines whether tests are running against containerised nats server
func IsNatsContainerised() bool {
	return os.Getenv(NATS_SERVER_IMAGE_URL_ENV_VAR_NAME) != ""
}

// IsNatsPersist determines whether tests are persist nats data between executions
func IsNatsPersist() bool {
	return os.Getenv(NATS_PERSIST_ENV_VAR_NAME) == "true"
}

// GetPackageName retrieves the name of a package a particular struct is declared in
func GetPackageName(packageNameStruct any) string {
	fullPackageName := reflect.TypeOf(packageNameStruct).PkgPath()
	packageNameSegments := strings.Split(fullPackageName, "/")
	packageName := packageNameSegments[len(packageNameSegments)-1]
	return packageName
}
