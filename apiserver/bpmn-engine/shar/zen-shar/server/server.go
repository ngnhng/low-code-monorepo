package server

import (
	"context"
	"crypto/rand"
	"fmt"
	"github.com/nats-io/nats.go"
	"github.com/segmentio/ksuid"
	"math/big"
	"net/netip"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	_ "embed"
	"github.com/docker/go-connections/nat"
	"github.com/nats-io/nats-server/v2/server"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
	"gitlab.com/shar-workflow/shar/common/authn"
	"gitlab.com/shar-workflow/shar/common/authz"
	version2 "gitlab.com/shar-workflow/shar/common/version"
	sharsvr "gitlab.com/shar-workflow/shar/server/server"
	"log/slog"
)

const (
	dockerHostName = "host.docker.internal"
)

type zenOpts struct {
	sharVersion                 string
	sharServerImageUrl          string
	natsServerImageUrl          string
	natsPersistHostPath         string
	natsServerAddress           string
	sharServerTelemetryEndpoint string
}

// ZenSharOptionApplyFn represents a SHAR Zen Server configuration function
type ZenSharOptionApplyFn func(cfg *zenOpts)

// WithNatsServerAddress provides a specific address for the NATS server.
func WithNatsServerAddress(addr string) ZenSharOptionApplyFn {
	return func(cfg *zenOpts) {
		cfg.natsServerAddress = addr
	}
}

// WithSharVersion artificially sets the reported server version.
func WithSharVersion(ver string) ZenSharOptionApplyFn {
	return func(cfg *zenOpts) {
		cfg.sharVersion = ver
	}
}

// WithSharServerImageUrl will make zen-shar start shar server in a container from the specificed image URL
func WithSharServerImageUrl(imageUrl string) ZenSharOptionApplyFn {
	return func(cfg *zenOpts) {
		cfg.sharServerImageUrl = imageUrl
	}
}

// WithNatsServerImageUrl will make zen-shar start nats server in a container from the specificed image URL
func WithNatsServerImageUrl(imageUrl string) ZenSharOptionApplyFn {
	return func(cfg *zenOpts) {
		cfg.natsServerImageUrl = imageUrl
	}
}

// WithNatsPersistHostPath will make zen-shar persist nats messages between test runs if we are running against a containerised nats server
func WithNatsPersistHostPath(natsPersistHostPath string) ZenSharOptionApplyFn {
	return func(cfg *zenOpts) {
		cfg.natsPersistHostPath = natsPersistHostPath
	}
}

// WithSharServerTelemetry will make zen-shar persist nats messages between test runs if we are running against a containerised nats server
func WithSharServerTelemetry(endpoint string) ZenSharOptionApplyFn {
	return func(cfg *zenOpts) {
		cfg.sharServerTelemetryEndpoint = endpoint
	}
}

//go:embed nats-server.conf
var natsConfig []byte

// GetServers returns a test NATS and SHAR server.
// nolint:ireturn
func GetServers(sharConcurrency int, apiAuth authz.APIFunc, authN authn.Check, option ...ZenSharOptionApplyFn) (Server, Server, error) {

	defaults := &zenOpts{sharVersion: version2.Version}
	for _, i := range option {
		i(defaults)
	}

	var nsvr Server
	nHost := "127.0.0.1"
	var nPort int

	natsConfigFileLocation, natsConfigFile := writeNatsConfig()

	if defaults.natsServerImageUrl != "" {
		defaultNatsContainerPort := "4222"
		cNsvr := inContainerNatsServer(defaults.natsServerImageUrl, defaultNatsContainerPort, natsConfigFileLocation, defaults.natsPersistHostPath)
		nPort = cNsvr.exposedToHostPorts[defaultNatsContainerPort]
		nsvr = cNsvr
	} else {
		natsServer, err := inProcessNatsServer(natsConfigFile, nHost, defaults)
		if err != nil {
			return nil, nil, err
		}
		nPort = natsServer.port
		nsvr = natsServer
	}

	var ssvr Server
	if defaults.sharServerImageUrl != "" {
		ssvr = inContainerSharServer(defaults.sharServerImageUrl, dockerHostName, nPort, defaults.sharServerTelemetryEndpoint)
	} else {
		ssvr = inProcessSharServer(sharConcurrency, apiAuth, authN, nHost, nPort, defaults.sharServerTelemetryEndpoint)
	}

	slog.Info("Setup completed", "nats port", nPort)
	return ssvr, nsvr, nil
}

func getRandomNatsPort() int {
	v, e := rand.Int(rand.Reader, big.NewInt(500))
	if e != nil {
		panic("no crypto:" + e.Error())
	}
	nPort := 4459 + int(v.Int64())

	return nPort
}

func parseUriOrAddressPort(address string) (string, int, error) {
	var a string
	var p int
	if strings.Contains(address, "://") {
		addr, err := url.Parse(address)
		if err != nil {
			return "", 0, fmt.Errorf("nats uri: %w", err)
		}
		address = addr.Host
	}
	addr, err := netip.ParseAddrPort(address)
	if err != nil {
		return "", 0, fmt.Errorf("parse address: %w", err)
	}
	a = addr.Addr().String()
	p = int(addr.Port())

	return a, p, nil
}

func writeNatsConfig() (string, string) {
	natsConfigFileLocation := fmt.Sprintf("%snats-conf/%s/", os.Getenv("TMPDIR"), ksuid.New().String())
	if err := os.MkdirAll(filepath.Dir(natsConfigFileLocation), 0777); err != nil {
		panic(fmt.Errorf("failed creating nats config dir: %w", err))
	}
	natsConfigFile := fmt.Sprintf("%s/nats-server.conf", natsConfigFileLocation)
	err := os.WriteFile(natsConfigFile, natsConfig, 0600)
	if err != nil {
		panic(fmt.Errorf("failed writing nats config %w", err))
	}
	return natsConfigFileLocation, natsConfigFile
}

func inProcessNatsServer(natsConfig string, defaultNatsHost string, defaults *zenOpts) (*NatsServer, error) {
	var nHost string
	var nPort int
	if defaults.natsServerAddress == "" {
		nHost = defaultNatsHost
		nPort = getRandomNatsPort()
	} else {
		a, p, err := parseUriOrAddressPort(defaults.natsServerAddress)
		if err != nil {
			return nil, err
		}
		nHost = a
		nPort = p
	}

	n := &NatsServer{natsConfig: natsConfig, host: nHost, port: nPort}
	n.Listen()
	return n, nil
}

func inContainerSharServer(sharServerImageUrl string, natsHost string, natsPort int, telemetryEndpoint string) *containerisedServer {
	ssvr := newContainerisedServer(testcontainers.ContainerRequest{
		Image:        sharServerImageUrl,
		ExposedPorts: []string{"50000/tcp"},
		WaitingFor:   wait.ForLog("shar api listener started"),
		Env: map[string]string{
			"NATS_URL": fmt.Sprintf("nats://%s:%d", natsHost, natsPort),
		}})

	ssvr.Listen()

	return ssvr
}

func inProcessSharServer(sharConcurrency int, apiAuth authz.APIFunc, authN authn.Check, natsHost string, natsPort int, telemetryEndpoint string) *sharsvr.Server {
	natsUrl := fmt.Sprintf("%s:%d", natsHost, natsPort)
	conn, err := nats.Connect(natsUrl)
	if err != nil {
		slog.Error("connect to NATS", err, slog.String("url", natsUrl))
		panic(err)
	}

	options := []sharsvr.Option{
		sharsvr.EphemeralStorage(),
		sharsvr.PanicRecovery(false),
		sharsvr.Concurrency(sharConcurrency),
		sharsvr.WithNoHealthServer(),
		sharsvr.NatsUrl(natsUrl),
		sharsvr.NatsConn(conn),
		sharsvr.GrpcPort(0),
		sharsvr.WithTelemetryEndpoint(telemetryEndpoint),
	}
	if apiAuth != nil {
		options = append(options, sharsvr.WithApiAuthorizer(apiAuth))
	}
	if authN != nil {
		options = append(options, sharsvr.WithAuthentication(authN))
	}

	ssvr := sharsvr.New(options...)
	go ssvr.Listen()
	for {
		if ssvr.Ready() {
			break
		}
		slog.Info("waiting for shar")
		time.Sleep(500 * time.Millisecond)
	}
	return ssvr
}

func inContainerNatsServer(natsServerImageUrl string, containerNatsPort string, natsConfigFileLocation string, natsPersistHostPath string) *containerisedServer {
	mounts := []testcontainers.ContainerMount{
		{
			Source: testcontainers.GenericBindMountSource{HostPath: natsConfigFileLocation},
			Target: "/etc/nats",
		},
	}

	if natsPersistHostPath != "" {
		mounts = append(mounts, testcontainers.ContainerMount{
			Source: testcontainers.GenericBindMountSource{HostPath: natsPersistHostPath},
			Target: "/tmp/nats/jetstream", // the default nats store dir (and in .conf file)
		})
	}

	ssvr := newContainerisedServer(testcontainers.ContainerRequest{
		Image:        natsServerImageUrl,
		ExposedPorts: []string{containerNatsPort},
		WaitingFor:   wait.ForLog("Listening for client connections").WithStartupTimeout(10 * time.Second),
		Entrypoint:   []string{"/nats-server"},
		Cmd:          []string{"--config", "/etc/nats/nats-server.conf"},
		Mounts:       mounts,
	})

	ssvr.Listen()

	return ssvr
}

// Server is a general interface representing either an inprocess or in container Shar server
type Server interface {
	Shutdown()
	Listen()
	GetEndPoint() string
}

// NatsServer is a wrapper around the nats lib server so that its lifecycle can be defined
// in terms of the Server interface needed by integration tests
type NatsServer struct {
	nsvr       *server.Server
	natsConfig string
	host       string
	port       int
}

// Listen starts an in process nats server
func (natserver *NatsServer) Listen() {
	//wd, err := os.Getwd()
	//if err != nil {
	//	return nil, nil, fmt.Errorf("failed to get working directory: %w", err)
	//}

	natsOptions, err := server.ProcessConfigFile(natserver.natsConfig)
	if err != nil {
		panic(fmt.Errorf("failed to load conf with err %w", err))
	}

	natsOptions.Host = natserver.host
	natsOptions.Port = natserver.port

	natsSvr, actualNatsPort := tryStartingNats(natsOptions, natserver.port, 1)

	slog.Info("NATS started")

	natserver.port = actualNatsPort
	natserver.nsvr = natsSvr
}

func tryStartingNats(natsOptions *server.Options, natsPort int, attempt int) (*server.Server, int) {
	natsOptions.Port = natsPort
	natsSvr, err := server.NewServer(natsOptions)

	if err != nil {
		panic(fmt.Errorf("create a new server instance: %w", err))
	}
	//nl := &NatsLogger{}
	//natsSvr.SetLogger(nl, true, false)

	go natsSvr.Start()
	if natsSvr.ReadyForConnections(5 * time.Second) {
		return natsSvr, natsPort
	} else {
		slog.Info("failed to start nats", "port", natsPort)
		natsSvr.Shutdown()
		if attempt == 3 {
			panic("start NATS failed after " + strconv.Itoa(attempt) + " attempts")
		} else {
			return tryStartingNats(natsOptions, getRandomNatsPort(), attempt+1)
		}
	}
}

// Shutdown shutsdown an in process nats server
func (natserver *NatsServer) Shutdown() {
	natserver.nsvr.Shutdown()
	natserver.nsvr.WaitForShutdown()
}

// GetEndPoint returns the url of the nats endpoint
func (natserver *NatsServer) GetEndPoint() string {
	return fmt.Sprintf("%s:%d", natserver.host, natserver.port)
}
func newContainerisedServer(req testcontainers.ContainerRequest) *containerisedServer {
	svr := &containerisedServer{
		req:                req,
		exposedToHostPorts: make(map[string]int),
	}
	return svr
}

// containerisedServer is a wrapper to the test containers test library allowing you to start or shut
// any Server you wish to startup/shutdown in a container
type containerisedServer struct {
	req                testcontainers.ContainerRequest
	container          testcontainers.Container
	exposedToHostPorts map[string]int
}

// Listen will startup the server in a container
func (cp *containerisedServer) Listen() {
	ctx := context.Background()
	container, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: cp.req,
		Started:          true,
	})

	if err != nil {
		slog.Error(fmt.Sprintf("failed to start container for request: %+v", cp.req))
		panic(err)
	}

	cp.container = container

	if len(cp.req.ExposedPorts) > 0 {
		for _, exposedPort := range cp.req.ExposedPorts {
			natPort, err := container.MappedPort(ctx, nat.Port(exposedPort))
			if err != nil {
				panic(err)
			}
			cp.exposedToHostPorts[exposedPort] = natPort.Int()
		}
	}

}

// Shutdown will shutdown the containerised shar server
func (cp *containerisedServer) Shutdown() {
	if cp.container != nil {
		ctx := context.Background()
		if err := cp.container.Terminate(ctx); err != nil {
			panic("failed to shutdown the container ")
		}
	}
}

func (cp *containerisedServer) GetEndPoint() string {
	if len(cp.req.ExposedPorts) > 0 {
		//clients only really care about a single port ... for now
		//just use the first one defined in the Exposed ports to get the host port
		return fmt.Sprintf("127.0.0.1:%d", cp.exposedToHostPorts[cp.req.ExposedPorts[0]])
	}
	return ""
}
