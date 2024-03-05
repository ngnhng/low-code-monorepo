package parser

import (
	"fmt"
	"io"
	"os"
	"strconv"
	"strings"

	"github.com/antchfx/xmlquery"
	"gitlab.com/shar-workflow/shar/common/element"
	"gitlab.com/shar-workflow/shar/common/linter"
	"gitlab.com/shar-workflow/shar/model"
	errors2 "gitlab.com/shar-workflow/shar/server/errors"

	"github.com/relvacode/iso8601"
)

//goland:noinspection HttpUrlsUsage
const bpmnNS = "http://www.omg.org/spec/BPMN/20100524/MODEL"

// Parse parses BPMN, and turns it into a SHAR state machine
func Parse(name string, rdr io.Reader) (*model.Workflow, error) {

	msgs := make(map[string]string)
	errs := make(map[string]string)
	doc, err := xmlquery.Parse(rdr)
	if err != nil {
		return nil, fmt.Errorf("parse xml: %w", err)
	}

	///TODO: Align namespace for the parse (the aliases are used in the XML navigation instead of the namespaces)

	prXmls := doc.SelectElements("//bpmn:process")
	wf := &model.Workflow{
		Name:             name,
		Process:          make(map[string]*model.Process, len(prXmls)),
		MessageReceivers: make(map[string]*model.MessageReceivers),
	}
	if collaboration := doc.SelectElements("//bpmn:collaboration"); len(collaboration) > 0 {
		if err := parseCollaboration(wf, collaboration[0]); err != nil {
			return nil, fmt.Errorf("parse collaboration: %w", err)
		}
	} else {
		wf.Collaboration = &model.Collaboration{}
	}

	msgXML := doc.SelectElements("//bpmn:message")
	errXML := doc.SelectElements("//bpmn:error")
	for _, prXML := range prXmls {
		pr := &model.Process{
			Elements: make([]*model.Element, 0),
		}

		pr.Name = prXML.SelectAttr("id")
		if err := parseProcess(doc, wf, prXML, pr, msgXML, errXML, msgs, errs); err != nil {
			return nil, fmt.Errorf("parse process: %w", err)
		}
		wf.Process[pr.Name] = pr
	}

	if err := tagWorkflow(wf); err != nil {
		return nil, fmt.Errorf("an error occured parsing the workflow: %w", err)
	}

	if err := validModel(wf); err != nil {
		return nil, fmt.Errorf("model is invalid: %w", err)
	}
	if msgs, err := linter.Lint(wf, true); err != nil {
		for _, i := range msgs {
			os.Stderr.WriteString(fmt.Sprintf("%v: %s", i.Type, i.Text))
		}
		return nil, fmt.Errorf("linting found issues: %w", err)
	}
	return wf, nil
}

func parseCollaboration(wf *model.Workflow, collaboration *xmlquery.Node) error {
	c := &model.Collaboration{}
	for _, i := range collaboration.SelectElements("bpmn:participant") {
		c.Participant = append(c.Participant,
			&model.Participant{
				Id:        i.SelectElement("@id").InnerText(),
				ProcessId: i.SelectElement("@processRef").InnerText(),
			},
		)
	}
	for _, i := range collaboration.SelectElements("bpmn:messageFlow") {
		c.MessageFlow = append(c.MessageFlow,
			&model.MessageFlow{
				Id:        i.SelectElement("@id").InnerText(),
				Sender:    i.SelectElement("@sourceRef").InnerText(),
				Recipient: i.SelectElement("@targetRef").InnerText(),
			},
		)
	}
	wf.Collaboration = c
	return nil
}

func parseProcess(doc *xmlquery.Node, wf *model.Workflow, prXML *xmlquery.Node, pr *model.Process, msgXML []*xmlquery.Node, errXML []*xmlquery.Node, msgs map[string]string, errs map[string]string) error {
	if msgXML != nil {
		if err := parseMessages(doc, wf, msgXML, msgs); err != nil {
			return fmt.Errorf("parse messages: %w", err)
		}
	}
	for _, i := range prXML.SelectElements("*") {
		if err := parseElements(doc, wf, pr, i, msgs, errs); err != nil {
			return fmt.Errorf("fasiled to parse elements: %w", err)
		}
	}
	if errXML != nil {
		parseErrors(doc, wf, errXML, errs)
	}
	for _, i := range prXML.SelectElements("//bpmn:boundaryEvent") {
		if err := parseBoundaryEvent(doc, i, pr); err != nil {
			return fmt.Errorf("parsing boundary events: %w", err)
		}
	}

	return nil
}

func parseMessages(doc *xmlquery.Node, wf *model.Workflow, msgNodes []*xmlquery.Node, msgs map[string]string) error {
	m := make([]*model.Element, len(msgNodes))
	for i, x := range msgNodes {
		m[i] = &model.Element{
			Id:   x.SelectElement("@id").InnerText(),
			Name: x.SelectElement("@name").InnerText(),
		}
		msgs[m[i].Id] = m[i].Name
		if err := parseZeebeExtensions(doc, m[i], x); err != nil {
			return fmt.Errorf("parsing zebee extensions: %w", err)
		}
	}
	wf.Messages = m
	return nil
}

func parseErrors(_ *xmlquery.Node, wf *model.Workflow, errNodes []*xmlquery.Node, errs map[string]string) {
	m := make([]*model.Error, len(errNodes))
	for i, x := range errNodes {
		m[i] = &model.Error{
			Id:   x.SelectElement("@id").InnerText(),
			Name: x.SelectElement("@name").InnerText(),
			Code: x.SelectElement("@errorCode").InnerText(),
		}
		errs[m[i].Id] = m[i].Name
	}
	wf.Errors = m
}

func parseElements(doc *xmlquery.Node, wf *model.Workflow, pr *model.Process, i *xmlquery.Node, msgs map[string]string, errs map[string]string) error {
	if i.NamespaceURI == bpmnNS {
		el := &model.Element{Type: i.Data}

		switch i.Data {
		// These are handled specially
		case "sequenceFlow", "incoming", "outgoing", "extensionElements", "boundaryEvent", "documentation":
			return nil
		// Intermediate catch events need special processing
		case "intermediateThrowEvent":
			parseIntermediateThrowEvent(i, el, wf, msgs)
		case "startEvent":
			if err := parseStartEvent(i, el, msgs, pr.Name, wf); err != nil {
				return fmt.Errorf("parse start events: %w", err)
			}
		case "exclusiveGateway":
			el.Type = element.Gateway
			el.Gateway = &model.GatewaySpec{Type: model.GatewayType_exclusive}
		case "parallelGateway":
			el.Type = element.Gateway
			el.Gateway = &model.GatewaySpec{Type: model.GatewayType_parallel}
		case "inclusiveGateway":
			el.Type = element.Gateway
			el.Gateway = &model.GatewaySpec{Type: model.GatewayType_inclusive}
		}

		parseCoreValues(i, el)
		parseFlowInOut(doc, i, el)
		parseDocumentation(i, el)
		parseElementErrors(doc, i, el)
		if err := parseZeebeExtensions(doc, el, i); err != nil {
			return fmt.Errorf("parse zebee extensions: %w", err)
		}
		if err := parseYalcExtensions(doc, el, i); err != nil {
			return fmt.Errorf("parse yalc extensions: %w", err)
		}
		if err := parseSubprocess(doc, wf, el, i, msgs, errs); err != nil {
			return fmt.Errorf("parse sub-processes: %w", err)
		}
		if err := parseSubscription(wf, el, i, msgs, errs); err != nil {
			return fmt.Errorf("parse subscription: %w", err)
		}
		pr.Elements = append(pr.Elements, el)
	}
	return nil
}

func parseIntermediateThrowEvent(i *xmlquery.Node, el *model.Element, wf *model.Workflow, msgs map[string]string) {
	if i.Data == "intermediateThrowEvent" {
		if def := i.SelectElement("bpmn:linkEventDefinition/@name"); def != nil {
			el.Type = element.LinkIntermediateThrowEvent
			el.Execute = def.InnerText()
		}
		if def := i.SelectElement("bpmn:messageEventDefinition"); def != nil {
			el.Type = element.MessageIntermediateThrowEvent
		}
	}
}

func parseStartEvent(n *xmlquery.Node, el *model.Element, msgs map[string]string, processId string, wf *model.Workflow) error {
	if def := n.SelectElement("bpmn:timerEventDefinition"); def != nil {
		timeCycle := def.SelectElement("bpmn:timeCycle/text()")
		timeDate := def.SelectElement("bpmn:timeDate/text()")
		if timeCycle == nil && timeDate == nil {
			return fmt.Errorf("parse start event: %w", errors2.ErrBadTimerEventDefinition)
		}
		var t *model.WorkflowTimerDefinition
		if timeDate != nil {
			tval, err := iso8601.ParseString(timeDate.Data)
			if err != nil {
				return fmt.Errorf("parse ISO8601 duration: %w", err)
			}
			t = &model.WorkflowTimerDefinition{
				Type:  model.WorkflowTimerType_fixed,
				Value: tval.UnixNano(),
			}
		} else {
			parts := strings.Split(timeCycle.Data, "/")
			if len(timeCycle.Data) == 0 || len(parts) > 2 || timeCycle.Data[0] != 'R' || !strings.Contains(timeCycle.Data, "/") {
				return fmt.Errorf("time cycle was malformed: %w", errors2.ErrBadTimeCycle)
			}

			repeat, err := strconv.Atoi(parts[0][1:])
			if err != nil {
				return fmt.Errorf("parse time cycle repeat: %w", errors2.ErrBadTimeCycle)
			}
			dur, err := ParseISO8601(parts[1])
			if err != nil {
				return fmt.Errorf("parse ISO 8601 failed: %w", err)
			}
			t = &model.WorkflowTimerDefinition{
				Type:       model.WorkflowTimerType_duration,
				Value:      dur.timeDuration().Nanoseconds(),
				Repeat:     int64(repeat),
				DropEvents: false,
			}
		}
		el.Timer = t
		el.Type = element.TimedStartEvent
	}
	if def := n.SelectElement("bpmn:messageEventDefinition"); def != nil {
		messageName := msgs[def.SelectAttr("messageRef")]
		el.Msg = messageName
		el.Type = element.StartEvent
		addReceiverForMessage(wf.MessageReceivers, wf.Name, messageName, &model.MessageReceiver{Id: n.SelectAttr("id"), ProcessIdToStart: processId})
	}
	return nil
}

func parseElementErrors(doc *xmlquery.Node, i *xmlquery.Node, el *model.Element) {
	if errorRef := i.SelectElement("//bpmn:errorEventDefinition/@errorRef"); errorRef != nil {
		tg := doc.SelectElement("//*[@id=\"" + errorRef.InnerText() + "\"]")
		el.Error = &model.Error{
			Id:   tg.SelectAttr("id"),
			Code: tg.SelectAttr("errorCode"),
			Name: tg.SelectAttr("name"),
		}
	}
}

func parseBoundaryEvent(doc *xmlquery.Node, i *xmlquery.Node, pr *model.Process) error {
	attach := i.SelectAttr("attachedToRef")
	var el *model.Element
	for _, i := range pr.Elements {
		if i.Id == attach {
			el = i
			break
		}
	}
	if err := parseBoundaryEventData(
		doc, i, el, "//bpmn:errorEventDefinition/@errorRef",
		func(ref *xmlquery.Node, attach *model.Element, target string) any {
			newCatchErr := &model.CatchError{
				Id:      i.SelectElement("//bpmn:errorEventDefinition/@id").InnerText(),
				ErrorId: ref.InnerText(),
				Target:  target,
			}
			attach.Errors = append(el.Errors, newCatchErr)
			return newCatchErr
		},
	); err != nil {
		return fmt.Errorf("processing error event definition: %w", err)
	}
	if err := parseBoundaryEventData(
		doc, i, el, "//bpmn:timerEventDefinition",
		func(ref *xmlquery.Node, attach *model.Element, target string) any {
			durationExpr := i.SelectElement("//bpmn:timeDuration").InnerText()
			newTimer := &model.Timer{
				Id:       i.SelectElement("//bpmn:timerEventDefinition/@id").InnerText(),
				Duration: durationExpr,
				Target:   target,
			}
			el.BoundaryTimer = append(el.BoundaryTimer, newTimer)
			return newTimer
		},
	); err != nil {
		return fmt.Errorf("processing error event definition: %w", err)
	}
	return nil
}

func parseBoundaryEventData(doc *xmlquery.Node, node *xmlquery.Node, attachRef *model.Element, selector string, fn func(*xmlquery.Node, *model.Element, string) any) error {
	if ref := node.SelectElement(selector); ref != nil {
		allFlow := node.SelectElements("..//bpmn:sequenceFlow")
		flowID := node.SelectElement("//bpmn:outgoing").InnerText()
		var target string
		for _, v := range allFlow {
			if v.SelectAttr("id") == flowID {
				target = v.SelectAttr("targetRef")
			}
		}
		newNode := fn(ref, attachRef, target)
		if err := parseZeebeExtensions(doc, newNode, node); err != nil {
			return fmt.Errorf("parsing zebee extensions: %w", err)
		}
	}
	return nil
}

func parseSubscription(wf *model.Workflow, el *model.Element, i *xmlquery.Node, msgs map[string]string, _ map[string]string) error {
	if i.Data == "intermediateCatchEvent" {
		if x := i.SelectElement("bpmn:messageEventDefinition/@messageRef"); x != nil {
			ref := x.InnerText()
			el.Type = element.MessageIntermediateCatchEvent
			messageName := msgs[ref]
			el.Msg = messageName

			addReceiverForMessage(wf.MessageReceivers, wf.Name, messageName, &model.MessageReceiver{Id: el.Id})

			c, err := getCorrelation(wf.Messages, el.Msg)
			if err != nil {
				return fmt.Errorf("get subscription correlation: %w", err)
			}
			el.Execute = c
			return nil
		}
		if x := i.SelectElement("bpmn:timerEventDefinition/bpmn:timeDuration"); x != nil {
			ref := x.InnerText()
			el.Type = element.TimerIntermediateCatchEvent
			dur, err := parseDuration(ref)
			if err != nil {
				return fmt.Errorf("parse duration: %w", err)
			}
			el.Execute = dur
			return nil
		}
		if x := i.SelectElement("bpmn:linkEventDefinition/@name"); x != nil {
			name := x.InnerText()
			el.Type = element.LinkIntermediateCatchEvent
			el.Execute = name
			return nil
		}
	}
	return nil
}

func addReceiverForMessage(messageReceivers map[string]*model.MessageReceivers, workflowName string, messageName string, messageReceiver *model.MessageReceiver) {
	receiversForMessage, ok := messageReceivers[messageName]
	if !ok {
		messageReceivers[messageName] = &model.MessageReceivers{AssociatedWorkflowName: workflowName, MessageReceiver: []*model.MessageReceiver{messageReceiver}}
	} else {
		receiversForMessage.MessageReceiver = append(receiversForMessage.MessageReceiver, messageReceiver)
	}
}

func parseDuration(ref string) (string, error) {
	ref = strings.TrimSpace(ref)
	if len(ref) == 0 {
		return "", fmt.Errorf("empty Duration found")
	}
	d, err := ParseISO8601(ref)
	if err != nil {
		if ref[1] == '=' {
			return ref, nil
		}
		return "", err
	}
	return strconv.Itoa(int(d.timeDuration().Nanoseconds())), nil
}

func getCorrelation(messages []*model.Element, msg string) (string, error) {
	for _, v := range messages {
		if v.Name == msg {
			return v.Execute, nil
		}
	}
	return "", fmt.Errorf("find message %s: %w", msg, errors2.ErrCorrelationFail)
}

func parseSubprocess(doc *xmlquery.Node, wf *model.Workflow, el *model.Element, i *xmlquery.Node, msgs map[string]string, errs map[string]string) error {
	if i.Data == "subProcess" {
		pr := &model.Process{
			Elements: make([]*model.Element, 0),
		}
		if err := parseProcess(doc, wf, i, pr, nil, nil, msgs, errs); err != nil {
			return fmt.Errorf("parse process: %w", err)
		}
		el.Process = pr
	}
	return nil
}

func parseDocumentation(i *xmlquery.Node, el *model.Element) {
	if e := i.SelectElement("bpmn:documentation"); e != nil {
		el.Documentation = e.InnerText()
	}
}

func parseConditions(i *xmlquery.Node) []string {
	cd := i.SelectElements("bpmn:conditionExpression")
	cds := make([]string, 0, len(cd))

	// Condition
	for _, j := range cd {
		cds = append(cds, j.InnerText())
	}
	if len(cds) > 0 {
		return cds
	}
	return nil
}

func parseCoreValues(i *xmlquery.Node, el *model.Element) {
	if e := i.SelectElement("@id"); e != nil {
		el.Id = e.InnerText()
	}
	if e := i.SelectElement("@name"); e != nil {
		el.Name = e.InnerText()
	}
}

func parseFlowInOut(doc *xmlquery.Node, i *xmlquery.Node, el *model.Element) {
	targets := &model.Targets{DefaultTarget: int64(-1)}
	var def string
	if i.Data == "exclusiveGateway" {
		def = i.SelectAttr("default")
	}
	c2 := i.SelectElements("bpmn:outgoing")
	elo := make([]*model.Target, 0, len(c2))
	for ord, c := range c2 {
		sf := doc.SelectElement("//bpmn:sequenceFlow[@id=\"" + c.InnerText() + "\"]")
		tg := doc.SelectElement("//*[@id=\"" + sf.SelectElement("@targetRef").InnerText() + "\"]")
		target := &model.Target{
			Id:         sf.SelectElement("@id").InnerText(),
			Target:     tg.SelectElement("@id").InnerText(),
			Conditions: parseConditions(sf),
		}
		elo = append(elo, target)
		if def == target.Id {
			targets.DefaultTarget = int64(ord)
		}
	}
	if len(elo) > 0 {
		targets.Target = elo
		el.Outbound = targets
	}
}
