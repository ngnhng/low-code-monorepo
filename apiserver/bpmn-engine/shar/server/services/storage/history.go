package storage

import (
	"context"
	"fmt"
	"gitlab.com/shar-workflow/shar/common"
	"gitlab.com/shar-workflow/shar/common/subj"
	"gitlab.com/shar-workflow/shar/model"
	"gitlab.com/shar-workflow/shar/server/errors"
)

// RecordHistoryProcessStart records the process start into the history object.
func (s *Nats) RecordHistoryProcessStart(ctx context.Context, state *model.WorkflowState) error {
	ns := subj.GetNS(ctx)
	nsKVs, err := s.KvsFor(ns)
	if err != nil {
		return fmt.Errorf("RecordHistoryProcessStart - failed getting KVs for ns %s: %w", ns, err)
	}

	e := &model.ProcessHistoryEntry{
		ItemType:          model.ProcessHistoryType_processExecute,
		WorkflowId:        &state.WorkflowId,
		ExecutionId:       &state.ExecutionId,
		CancellationState: &state.State,
		Vars:              state.Vars,
		Timer:             state.Timer,
		Error:             state.Error,
		UnixTimeNano:      state.UnixTimeNano,
		Execute:           state.Execute,
	}
	ph := &model.ProcessHistory{Item: []*model.ProcessHistoryEntry{e}}
	if err := common.SaveObj(ctx, nsKVs.wfHistory, state.ProcessInstanceId, ph); err != nil {
		return &errors.ErrWorkflowFatal{Err: fmt.Errorf("recording history for process start: %w", err)}
	}
	return nil
}

// RecordHistoryActivityExecute records the activity execute into the history object.
func (s *Nats) RecordHistoryActivityExecute(ctx context.Context, state *model.WorkflowState) error {
	ns := subj.GetNS(ctx)
	nsKVs, err := s.KvsFor(ns)
	if err != nil {
		return fmt.Errorf("RecordHistoryActivityExecute - failed getting KVs for ns %s: %w", ns, err)
	}

	e := &model.ProcessHistoryEntry{
		ItemType:          model.ProcessHistoryType_activityExecute,
		ElementId:         &state.ElementId,
		CancellationState: &state.State,
		Vars:              state.Vars,
		Timer:             state.Timer,
		Error:             state.Error,
		UnixTimeNano:      state.UnixTimeNano,
		Execute:           state.Execute,
	}
	ph := &model.ProcessHistory{}
	if err := common.UpdateObj(ctx, nsKVs.wfHistory, state.ProcessInstanceId, ph, func(v *model.ProcessHistory) (*model.ProcessHistory, error) {
		v.Item = append(v.Item, e)
		return v, nil
	}); err != nil {
		return &errors.ErrWorkflowFatal{Err: fmt.Errorf("recording history for activity execute: %w", err)}
	}
	return nil
}

// RecordHistoryActivityComplete records the activity completion into the history object.
func (s *Nats) RecordHistoryActivityComplete(ctx context.Context, state *model.WorkflowState) error {
	ns := subj.GetNS(ctx)
	nsKVs, err := s.KvsFor(ns)
	if err != nil {
		return fmt.Errorf("RecordHistoryActivityComplete - failed getting KVs for ns %s: %w", ns, err)
	}

	e := &model.ProcessHistoryEntry{
		ItemType:          model.ProcessHistoryType_activityComplete,
		ElementId:         &state.ElementId,
		CancellationState: &state.State,
		Vars:              state.Vars,
		Timer:             state.Timer,
		Error:             state.Error,
		UnixTimeNano:      state.UnixTimeNano,
	}
	ph := &model.ProcessHistory{}
	if err := common.UpdateObj(ctx, nsKVs.wfHistory, state.ProcessInstanceId, ph, func(v *model.ProcessHistory) (*model.ProcessHistory, error) {
		v.Item = append(v.Item, e)
		return v, nil
	}); err != nil {
		return &errors.ErrWorkflowFatal{Err: fmt.Errorf("recording history for ectivity complete: %w", err)}
	}
	return nil
}

// RecordHistoryProcessComplete records the process completion into the history object.
func (s *Nats) RecordHistoryProcessComplete(ctx context.Context, state *model.WorkflowState) error {
	ns := subj.GetNS(ctx)
	nsKVs, err := s.KvsFor(ns)
	if err != nil {
		return fmt.Errorf("RecordHistoryProcessComplete - failed getting KVs for ns %s: %w", ns, err)
	}

	e := &model.ProcessHistoryEntry{
		ItemType:          model.ProcessHistoryType_processComplete,
		CancellationState: &state.State,
		Vars:              state.Vars,
		Timer:             state.Timer,
		Error:             state.Error,
		UnixTimeNano:      state.UnixTimeNano,
	}
	ph := &model.ProcessHistory{}
	if err := common.UpdateObj(ctx, nsKVs.wfHistory, state.ProcessInstanceId, ph, func(v *model.ProcessHistory) (*model.ProcessHistory, error) {
		v.Item = append(v.Item, e)
		return v, nil
	}); err != nil {
		return &errors.ErrWorkflowFatal{Err: fmt.Errorf("recording history for process complete: %w", err)}
	}
	return nil
}

// RecordHistoryProcessSpawn records the process spawning a new process into the history object.
func (s *Nats) RecordHistoryProcessSpawn(ctx context.Context, state *model.WorkflowState, newProcessInstanceID string) error {
	ns := subj.GetNS(ctx)
	nsKVs, err := s.KvsFor(ns)
	if err != nil {
		return fmt.Errorf("RecordHistoryProcessSpawn - failed getting KVs for ns %s: %w", ns, err)
	}

	e := &model.ProcessHistoryEntry{
		ItemType:          model.ProcessHistoryType_processSpawnSync,
		CancellationState: &state.State,
		Vars:              state.Vars,
		Timer:             state.Timer,
		Error:             state.Error,
		UnixTimeNano:      state.UnixTimeNano,
	}
	ph := &model.ProcessHistory{}
	if err := common.UpdateObj(ctx, nsKVs.wfHistory, state.ProcessInstanceId, ph, func(v *model.ProcessHistory) (*model.ProcessHistory, error) {
		v.Item = append(v.Item, e)
		return v, nil
	}); err != nil {
		return &errors.ErrWorkflowFatal{Err: fmt.Errorf("recording history for process start: %w", err)}
	}
	return nil
}

// RecordHistoryProcessAbort records the process aborting into the history object.
func (s *Nats) RecordHistoryProcessAbort(ctx context.Context, state *model.WorkflowState) error {
	ns := subj.GetNS(ctx)
	nsKVs, err := s.KvsFor(ns)
	if err != nil {
		return fmt.Errorf("RecordHistoryProcessAbort - failed getting KVs for ns %s: %w", ns, err)
	}

	e := &model.ProcessHistoryEntry{
		ItemType:          model.ProcessHistoryType_processAbort,
		CancellationState: &state.State,
		Vars:              state.Vars,
		Timer:             state.Timer,
		Error:             state.Error,
		UnixTimeNano:      state.UnixTimeNano,
	}
	ph := &model.ProcessHistory{}
	if err := common.UpdateObj(ctx, nsKVs.wfHistory, state.ProcessInstanceId, ph, func(v *model.ProcessHistory) (*model.ProcessHistory, error) {
		v.Item = append(v.Item, e)
		return v, nil
	}); err != nil {
		return &errors.ErrWorkflowFatal{Err: fmt.Errorf("recording history for process complete: %w", err)}
	}
	return nil
}

// GetProcessHistory fetches the history object for a process.
func (s *Nats) GetProcessHistory(ctx context.Context, processInstanceId string) ([]*model.ProcessHistoryEntry, error) {
	ns := subj.GetNS(ctx)
	nsKVs, err := s.KvsFor(ns)
	if err != nil {
		return nil, fmt.Errorf("GetProcessHistory - failed getting KVs for ns %s: %w", ns, err)
	}

	ph := &model.ProcessHistory{}
	if err := common.LoadObj(ctx, nsKVs.wfHistory, processInstanceId, ph); err != nil {
		return nil, fmt.Errorf("fetching history for process: %w", err)
	}
	return ph.Item, nil
}
