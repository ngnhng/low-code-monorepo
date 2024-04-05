package linter

import (
	errors2 "errors"
	"fmt"
	"gitlab.com/shar-workflow/shar/common"
	"gitlab.com/shar-workflow/shar/common/element"
	"gitlab.com/shar-workflow/shar/model"
)

type directedTraversalInstruction struct {
	EndOfProcess func(elem *model.Element) error
	Cyclic       func(element *model.Element, target *model.Element, otherTarget *model.Element) error
}

func startDirectedScan(process *model.Process, instruction *directedTraversalInstruction) error {
	visited := make(map[string]*model.Element)
	starts := findProcessStarts(process)
	index := make(map[string]*model.Element)
	common.IndexProcessElements(process.Elements, index)
	for _, start := range starts {
		visited[start.Id] = start
		if err := directedColouredTraverse(start, visited, instruction, index); err != nil {
			return fmt.Errorf("directed graph scan failed: %w", err)
		}
	}
	return nil
}

func findProcessStarts(process *model.Process) []*model.Element {
	starts := make([]*model.Element, 0)
	for _, elem := range process.Elements {
		switch elem.Type {
		//TODO: Add new start event types as they come on board
		case element.StartEvent, element.TimedStartEvent:
			starts = append(starts, elem)
		}
	}
	return starts
}

func directedColouredTraverse(el *model.Element, visited map[string]*model.Element, instruction *directedTraversalInstruction, index map[string]*model.Element) error {
	targets := make([]string, 0)
	if el.Type == element.LinkIntermediateThrowEvent {
		var target *model.Element
		for _, srch := range index {
			if srch != el && srch.Execute == el.Execute {
				target = el
			}
		}
		if target == nil {
			return fmt.Errorf("find element referred to in %s %s(%s): %w", el.Type, el.Name, el.Id, errors2.New("link references non-existent target"))
		}
		targets = append(targets, target.Id)
	} else if el.Outbound != nil {
		for _, t := range el.Outbound.Target {
			targets = append(targets, t.Target)
		}
	}
	if len(targets) > 0 {
		for _, t := range targets {
			target := index[t]
			if otherTarget, ok := visited[target.Id]; ok {
				if instruction.Cyclic != nil {
					if err := instruction.Cyclic(el, target, otherTarget); err != nil {
						return fmt.Errorf("cyclic check found error: %w", err)
					}
				}
				return nil
			}
			visited[target.Id] = el
			if err := directedColouredTraverse(target, visited, instruction, index); err != nil {
				return fmt.Errorf("%w", err)
			}
		}
	} else {
		if instruction.EndOfProcess != nil {
			if err := instruction.EndOfProcess(el); err != nil {
				return fmt.Errorf("%w", err)
			}
		}
	}
	return nil
}
