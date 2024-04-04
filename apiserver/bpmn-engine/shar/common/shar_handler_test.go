package common

import (
	"context"
	"fmt"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"
	"gitlab.com/shar-workflow/shar/model"
	"log/slog"
	"testing"
	"time"
)

type MockedLogPublisher struct {
	mock.Mock
}

func (lp *MockedLogPublisher) Publish(ctx context.Context, lr *model.LogRequest) error {
	args := lp.Called(ctx, lr)
	return fmt.Errorf("pub err: %w", args.Error(0))
}

type SharHandlerSuite struct {
	suite.Suite
	sharHandler slog.Handler
	mlp         *MockedLogPublisher
}

func (shs *SharHandlerSuite) SetupTest() {
	lp := new(MockedLogPublisher)

	sharHandlerOptions := HandlerOptions{}
	sharHandler := NewSharHandler(sharHandlerOptions, lp)

	shs.sharHandler = sharHandler
	shs.mlp = lp
}

func TestSharHandlerSuite(t *testing.T) {
	suite.Run(t, new(SharHandlerSuite))
}

func (shs *SharHandlerSuite) TestSharHandlerEnabled() {
	sharHandlerOptions := HandlerOptions{Level: slog.LevelDebug}
	sharHandler := NewSharHandler(sharHandlerOptions, nil)

	ctx := context.Background()
	isEnabled := sharHandler.Enabled(ctx, slog.LevelDebug)

	assert.Equal(shs.T(), isEnabled, true)
}

func (shs *SharHandlerSuite) TestSharHandlerDisabled() {
	sharHandlerOptions := HandlerOptions{Level: slog.LevelWarn}
	sharHandler := NewSharHandler(sharHandlerOptions, nil)

	ctx := context.Background()
	isEnabled := sharHandler.Enabled(ctx, slog.LevelInfo)

	assert.Equal(shs.T(), isEnabled, false)
}

func (shs *SharHandlerSuite) TestSharHandlerEnabledWhenNoLevelSet() {

	ctx := context.Background()
	isEnabled := shs.sharHandler.Enabled(ctx, slog.LevelInfo)

	assert.Equal(shs.T(), isEnabled, true)
}

func (shs *SharHandlerSuite) TestSharHandlerHandleWithAttrsAndGroups() {
	ctx := context.Background()

	k0 := "k0"
	v0 := "attrFromLogger"

	groupA, groupB := "groupA", "groupB"
	k1, k2, k3 := "k1", "k2", "k3"
	v1, v2, v3 := "v1", true, "v3"

	fiveSecondsAgo := time.Now().Add(-time.Second * 5)
	logMessage := "log message foobar"
	logLevel := slog.LevelInfo
	shs.mlp.On("Publish", mock.Anything, mock.MatchedBy(func(lr *model.LogRequest) bool {
		return lr.Message == logMessage &&
			lr.Time == fiveSecondsAgo.UnixMilli() &&
			lr.Level == int32(logLevel) &&
			lr.Source == model.LogSource_logSourceEngine &&
			lr.Hostname != "" &&
			lr.Attributes[k0] == v0 &&
			lr.Attributes[k1] == v1 &&
			lr.Attributes[fmt.Sprintf("%s.%s", groupA, k2)] == "true" &&
			lr.Attributes[fmt.Sprintf("%s.%s.%s", groupA, groupB, k3)] == v3

	})).Return(nil)

	handler := shs.sharHandler.
		WithAttrs([]slog.Attr{slog.String(k1, v1)}).
		WithGroup(groupA).
		WithAttrs([]slog.Attr{slog.Bool(k2, v2)}).
		WithGroup(groupB).
		WithAttrs([]slog.Attr{slog.String(k3, v3)})

	record := slog.Record{
		Time:    fiveSecondsAgo,
		Message: logMessage,
		Level:   logLevel,
	}

	record.AddAttrs(slog.String(k0, v0))

	_ = handler.Handle(ctx, record)

	shs.mlp.AssertExpectations(shs.T())
}
