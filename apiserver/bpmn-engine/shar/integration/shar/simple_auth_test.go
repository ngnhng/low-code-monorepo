package intTest

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/golang-jwt/jwt"
	"github.com/segmentio/ksuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gitlab.com/shar-workflow/shar/client"
	"gitlab.com/shar-workflow/shar/client/taskutil"
	"gitlab.com/shar-workflow/shar/common/header"
	support "gitlab.com/shar-workflow/shar/integration-support"
	"gitlab.com/shar-workflow/shar/model"
	"gitlab.com/shar-workflow/shar/server/errors"
	"os"
	"strings"
	"testing"
	"time"
)

// All HS256
const testUserSimpleWorkflowJWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJnby13b3JrZmxvdy5jb20iLCJleHAiOjI1NTQ3MzAwNzEsImdyYW50IjoiU2ltcGxlUHJvY2VzczpSWFdTLFNpbXBsZVdvcmtmbG93VGVzdDpSWFdTIiwiaWF0IjoxNjcxMTE3MjcxLCJpc3MiOiJTaGFySW50ZWdyYXRpb24iLCJ1c2VyIjoiVGVzdFVzZXIifQ.YHLtRgue2DEcW4UtGMwAKbbnQvdA8gPt55PeQgxRr-U"
const testUserReadOnlyJWT = "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJTaGFySW50ZWdyYXRpb24iLCJ1c2VyIjoiVGVzdFVzZXIiLCJncmFudCI6IlNpbXBsZVdvcmtmbG93VGVzdDpSIiwiZXhwIjoyNTU0NzMwMDcxLCJpYXQiOjE2NzExMTcyNzEsImF1ZCI6ImdvLXdvcmtmbG93LmNvbSJ9.marPR5Cl3EZe9jDGCa3Y8r8q8svOHDKeYaer9SkFwLI"
const randomUserJWT = "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJTaGFySW50ZWdyYXRpb24iLCJ1c2VyIjoiVGVzdFVzZXIiLCJncmFudCI6IlNpbXBsZVdvcmtmbG93VGVzdDpSWFdTIiwiZXhwIjoyNTU0NzMwMDcxLCJpYXQiOjE2NzExMTcyNzEsImF1ZCI6Imp3dC5pbyJ9.0tK1B68thRKXiW6tLvWgGQfZDZjjDv2pM81Hru0toNk"
const testJWTKey = "SuperSecretKey"
const testIssuer = "SharIntegration"
const testAlg = "HS256"
const testAud = "go-workflow.com"

func TestSimpleAuthZ(t *testing.T) {
	t.Parallel()
	tst := support.NewIntegrationT(t, testAuthZFn, testAuthNFn, false, nil, nil)
	tst.Setup()
	defer tst.Teardown()

	// Create a starting context
	ctx := context.Background()
	ctx = header.Set(ctx, "JWT", testUserSimpleWorkflowJWT)
	// Dial shar
	ns := ksuid.New().String()
	cl := client.New(client.WithEphemeralStorage(), client.WithConcurrency(10), client.WithNamespace(ns))
	err := cl.Dial(ctx, tst.NatsURL)
	require.NoError(t, err)

	d := &testSimpleAuthHandlerDef{t: t, finished: make(chan struct{})}

	// Register a service task
	err = taskutil.RegisterTaskYamlFile(ctx, cl, "simple/simple_test.yaml", d.integrationSimple)
	require.NoError(t, err)

	// Load BPMN workflow
	b, err := os.ReadFile("../../testdata/simple-workflow.bpmn")
	require.NoError(t, err)

	_, err = cl.LoadBPMNWorkflowFromBytes(ctx, "SimpleWorkflowTest", b)
	require.NoError(t, err)

	err = cl.RegisterProcessComplete("SimpleProcess", d.processEnd)
	require.NoError(t, err)
	// Launch the workflow
	_, _, err = cl.LaunchProcess(ctx, "SimpleProcess", model.Vars{})
	require.NoError(t, err)
	// Listen for service tasks
	go func() {
		err := cl.Listen(ctx)
		require.NoError(t, err)
	}()

	support.WaitForChan(t, d.finished, 20*time.Second)
	tst.AssertCleanKV(ns, t, 60*time.Second)
}

func TestNoAuthN(t *testing.T) {
	t.Parallel()
	tst := support.NewIntegrationT(t, testAuthZFn, testAuthNFn, false, func() (bool, string) {
		return !support.IsSharContainerised(), "authN test not runnable with containerised Shar"
	}, nil)
	tst.Setup()
	defer tst.Teardown()

	// Create a starting context
	ctx := context.Background()
	ctx = header.Set(ctx, "JWT", randomUserJWT)
	// Dial shar
	cl := client.New(client.WithEphemeralStorage(), client.WithConcurrency(10))
	err := cl.Dial(ctx, tst.NatsURL)
	assert.ErrorContains(t, err, "authenticate")

	err = taskutil.RegisterTaskYamlFile(ctx, cl, "simple_auth_test_SimpleProcess.yaml", nil)
	require.Error(t, err)

}

func TestSimpleNoAuthZ(t *testing.T) {
	t.Parallel()
	tst := support.NewIntegrationT(t, testAuthZFn, testAuthNFn, false, func() (bool, string) {
		return !support.IsSharContainerised(), "authZ test not runnable with containerised Shar"
	}, nil)
	//tst.WithTrace = true
	tst.Setup()
	defer tst.Teardown()

	// Create a starting context
	ctx := context.Background()
	ctx = header.Set(ctx, "JWT", testUserReadOnlyJWT)
	// Dial shar
	ns := ksuid.New().String()
	cl := client.New(client.WithEphemeralStorage(), client.WithConcurrency(10), client.WithNamespace(ns))
	err := cl.Dial(ctx, tst.NatsURL)
	require.NoError(t, err)

	// Load BPMN workflow
	b, err := os.ReadFile("../../testdata/simple-workflow.bpmn")
	require.NoError(t, err)

	_, err = cl.LoadBPMNWorkflowFromBytes(ctx, "SimpleWorkflowTest", b)
	assert.ErrorContains(t, err, "authorize")

	tst.AssertCleanKV(ns, t, tst.Cooldown)
}

func testAuthNFn(ctx context.Context, request *model.ApiAuthenticationRequest) (*model.ApiAuthenticationResponse, error) {
	fmt.Println("AUTHN:", request.Headers)
	j := request.Headers["JWT"]
	claims := jwt.MapClaims{}
	if token, err := jwt.ParseWithClaims(j, claims, func(token *jwt.Token) (interface{}, error) { return []byte(testJWTKey), nil }); err != nil {
		return nil, fmt.Errorf("invalid token: %w", errors.ErrApiAuthZFail)
	} else if token.Header["alg"] != testAlg ||
		!claims.VerifyAudience(testAud, true) ||
		!claims.VerifyIssuer(testIssuer, true) ||
		!claims.VerifyExpiresAt(time.Now().Unix(), true) ||
		!claims.VerifyIssuedAt(time.Now().Unix(), true) {
		return nil, fmt.Errorf("invalid token: %w", errors.ErrApiAuthZFail)
	}
	return &model.ApiAuthenticationResponse{Authenticated: true, User: claims["user"].(string)}, nil
}

func testAuthZFn(ctx context.Context, request *model.ApiAuthorizationRequest) (*model.ApiAuthorizationResponse, error) {
	fmt.Println("AUTHZ:", request.Function, request.User, request.Headers)
	j := request.Headers["JWT"]
	start := strings.IndexByte(j, '.') + 1
	end := strings.LastIndexByte(j, '.')
	seg := j[start:end]
	var claims map[string]interface{}
	if js, err := jwt.DecodeSegment(seg); err == nil {
		err := json.Unmarshal(js, &claims)
		if err != nil {
			return nil, fmt.Errorf("invalid token: %w", errors.ErrApiAuthZFail)
		}
	} else {
		if err != nil {
			return nil, fmt.Errorf("invalid token: %w", errors.ErrApiAuthZFail)
		}
	}
	if claims["grant"] == nil {
		return nil, fmt.Errorf("unauthorised: %w", errors.ErrApiAuthZFail)
	}
	wf := make(map[string]map[string]struct{})
	for _, i := range strings.Split(claims["grant"].(string), ",") {
		spl := strings.Split(i, ":")
		sub := make(map[string]struct{})
		for _, j := range spl[1] {
			sub[string(j)] = struct{}{}
		}
		wf[spl[0]] = sub
	}

	return &model.ApiAuthorizationResponse{Authorized: APIauth(request.Function, wf[request.WorkflowName])}, nil
}

func APIauth(api string, permissions map[string]struct{}) bool {
	fmt.Println(api)
	switch api {
	case "WORKFLOW.Api.StoreWorkflow":
		_, ok := permissions["W"]
		return ok
	case "Workflow.Api.RegisterTask":
		// IRL This should be checked versus a permission
		return true
	case "WORKFLOW.Api.GetServiceTaskRoutingID":
		return true
	case "WORKFLOW.Api.GetJob":
		return true
	case "WORKFLOW.Api.LaunchProcess":
		_, ok := permissions["X"]
		return ok
	case "WORKFLOW.Api.CompleteServiceTask":
		_, ok := permissions["S"]
		return ok
	default:
		return false
	}
}

type testSimpleAuthHandlerDef struct {
	t        *testing.T
	finished chan struct{}
}

func (d *testSimpleAuthHandlerDef) integrationSimple(_ context.Context, _ client.JobClient, vars model.Vars) (model.Vars, error) {
	fmt.Println("Hi")
	assert.Equal(d.t, 32768, vars["carried"].(int))
	vars["Success"] = true
	return vars, nil
}

func (d *testSimpleAuthHandlerDef) processEnd(ctx context.Context, vars model.Vars, wfError *model.Error, state model.CancellationState) {
	close(d.finished)
}
