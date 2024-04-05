package common

import (
	"context"
	"fmt"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"
	"log/slog"
	"testing"
)

type MockDelegateHandler1 struct {
	mock.Mock
}

func (mdh1 *MockDelegateHandler1) Enabled(ctx context.Context, level slog.Level) bool {
	called := mdh1.Called(ctx, level)
	return called.Bool(0)
}

func (mdh1 *MockDelegateHandler1) Handle(ctx context.Context, r slog.Record) error {
	called := mdh1.Called(ctx, r)
	return fmt.Errorf("Handle err: %w", called.Error(0))
}

func (mdh1 *MockDelegateHandler1) WithAttrs(attrs []slog.Attr) slog.Handler {
	called := mdh1.Called(attrs)
	return called.Get(0).(slog.Handler)
}

func (mdh1 *MockDelegateHandler1) WithGroup(name string) slog.Handler {
	called := mdh1.Called(name)
	return called.Get(0).(slog.Handler)
}

type MockDelegateHandler2 struct {
	mock.Mock
}

func (mdh2 *MockDelegateHandler2) Enabled(ctx context.Context, level slog.Level) bool {
	called := mdh2.Called(ctx, level)
	return called.Bool(0)
}

func (mdh2 *MockDelegateHandler2) Handle(ctx context.Context, r slog.Record) error {
	called := mdh2.Called(ctx, r)
	return fmt.Errorf("Handle err: %w", called.Error(0))
}

func (mdh2 *MockDelegateHandler2) WithAttrs(attrs []slog.Attr) slog.Handler {
	called := mdh2.Called(attrs)
	return called.Get(0).(slog.Handler)
}

func (mdh2 *MockDelegateHandler2) WithGroup(name string) slog.Handler {
	called := mdh2.Called(name)
	return called.Get(0).(slog.Handler)
}

type MultiHandlerTestSuite struct {
	suite.Suite
	multiHandler *MultiHandler
	handler1     *MockDelegateHandler1
	handler2     *MockDelegateHandler2
}

func (mhts *MultiHandlerTestSuite) SetupTest() {
	h1 := new(MockDelegateHandler1)
	h2 := new(MockDelegateHandler2)

	mh := NewMultiHandler([]slog.Handler{h1, h2})

	mhts.multiHandler = mh
	mhts.handler1 = h1
	mhts.handler2 = h2
}

func TestMultiHandlerTestSuite(t *testing.T) {
	suite.Run(t, new(MultiHandlerTestSuite))
}

func (mhts *MultiHandlerTestSuite) TestWithAttrsDelegatesToHandlers() {

	attrs := []slog.Attr{slog.String("k", "v")}

	mockDelegate1WithNewAttrs := &MockDelegateHandler1{}
	mockDelegate2WithNewAttrs := &MockDelegateHandler2{}
	mhts.handler1.On("WithAttrs", attrs).Return(mockDelegate1WithNewAttrs)
	mhts.handler2.On("WithAttrs", attrs).Return(mockDelegate2WithNewAttrs)

	multiWithAttrs := mhts.multiHandler.WithAttrs(attrs).(*MultiHandler)

	mhts.handler1.AssertCalled(mhts.T(), "WithAttrs", attrs)
	mhts.handler2.AssertCalled(mhts.T(), "WithAttrs", attrs)

	assert.Contains(mhts.T(), multiWithAttrs.Handlers, mockDelegate1WithNewAttrs)
	assert.Contains(mhts.T(), multiWithAttrs.Handlers, mockDelegate2WithNewAttrs)
}

func (mhts *MultiHandlerTestSuite) TestWithGroupDelegatesToHandlers() {
	delegateHandler1WithGroup := &MockDelegateHandler1{}
	delegateHandler2WithGroup := &MockDelegateHandler2{}
	groupName := "theGroupName"

	mhts.handler1.On("WithGroup", groupName).Return(delegateHandler1WithGroup)
	mhts.handler2.On("WithGroup", groupName).Return(delegateHandler2WithGroup)

	multiHandlerWithGroup := mhts.multiHandler.WithGroup(groupName).(*MultiHandler)

	assert.Contains(mhts.T(), multiHandlerWithGroup.Handlers, delegateHandler1WithGroup)
	assert.Contains(mhts.T(), multiHandlerWithGroup.Handlers, delegateHandler2WithGroup)
}

func (mhts *MultiHandlerTestSuite) TestHandleDelegatesToHandlersOnlyIfEnabled() {
	ctx := context.Background()
	record := slog.Record{Level: slog.LevelInfo}

	mhts.handler1.On("Handle", ctx, record).Return(nil)
	mhts.handler1.On("Enabled", ctx, record.Level).Return(true)

	mhts.handler2.On("Handle", ctx, record).Return(nil)
	mhts.handler2.On("Enabled", ctx, record.Level).Return(false)

	_ = mhts.multiHandler.Handle(ctx, record)

	mhts.handler1.AssertCalled(mhts.T(), "Handle", ctx, record)
	mhts.handler2.AssertNotCalled(mhts.T(), "Handle", ctx, record)
}
