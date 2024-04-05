package parser

import (
	"fmt"
	"github.com/antchfx/xmlquery"
	"gitlab.com/shar-workflow/shar/model"
	"strconv"
	"strings"
)

func parseZeebeExtensions(doc *xmlquery.Node, modelElement interface{}, i *xmlquery.Node) error {
	switch el := modelElement.(type) {
	case *model.Element:
		if x := i.SelectElement("bpmn:extensionElements"); x != nil {
			//Task Definitions
			if e := x.SelectElement("zeebe:taskDefinition/@type"); e != nil {
				el.Execute = e.InnerText()
			}
			if e := x.SelectElement("zeebe:taskDefinition/@retries"); e != nil {
				retries, err := strconv.ParseUint(e.InnerText(), 10, 32)
				if err != nil {
					return fmt.Errorf("'retries' parse uint32 conversion error: %w", err)
				}
				el.RetryBehaviour = &model.DefaultTaskRetry{
					Number:          uint32(retries),
					Strategy:        0,
					InitMilli:       0,
					IntervalMilli:   0,
					MaxMilli:        0,
					DefaultExceeded: nil,
				}
			}
			if e := x.SelectElement("zeebe:calledElement/@processId"); e != nil {
				el.Execute = e.InnerText()
			}
			if e := x.SelectElement("zeebe:calledElement/@processId"); e != nil {
				el.Execute = e.InnerText()
			}
			//Form Definitions
			if fk := x.SelectElement("zeebe:formDefinition/@formKey"); fk != nil {
				fullName := strings.Split(fk.InnerText(), ":")
				name := fullName[len(fullName)-1]
				f := doc.SelectElement("//zeebe:userTaskForm[@id=\"" + name + "\"]").InnerText()
				el.Execute = f
			}

			//Assignment Definition
			if e := x.SelectElement("zeebe:assignmentDefinition/@assignee"); e != nil {
				el.Candidates = e.InnerText()
			}

			//Assignment Definition
			if e := x.SelectElement("zeebe:assignmentDefinition/@candidateGroups"); e != nil {
				el.CandidateGroups = e.InnerText()
			}

			//Messages
			if e := x.SelectElement("zeebe:subscription/@correlationKey"); e != nil {
				el.Execute = e.InnerText()
			}

			//Input/Output
			if e := x.SelectElement("zeebe:ioMapping"); e != nil {
				if o := e.SelectElements("zeebe:output"); o != nil {
					el.OutputTransform = make(map[string]string)
					for _, j := range o {
						el.OutputTransform[j.SelectAttr("target")] = j.SelectAttr("source")
					}
				}
				if o := e.SelectElements("zeebe:input"); o != nil {
					el.InputTransform = make(map[string]string)
					for _, j := range o {
						el.InputTransform[j.SelectAttr("target")] = j.SelectAttr("source")
					}
				}
			}
			//<zeebe:loopCharacteristics inputCollection="=a" inputElement="b" outputCollection="c" outputElement="=d" />
			if e := x.SelectElement("zeebe:loopCharacteristics"); e != nil {
				el.Iteration = &model.Iteration{}
				if e := x.SelectElement("zeebe:loopCharacteristics/@inputCollection"); e != nil {
					el.Iteration.Collection = e.InnerText()
				}
				if e := x.SelectElement("zeebe:loopCharacteristics/@inputElement"); e != nil {
					el.Iteration.Iterator = e.InnerText()
				}
				if e := x.SelectElement("zeebe:loopCharacteristics/@outputCollection"); e != nil {
					el.Iteration.CollateAs = e.InnerText()
				}
				if e := x.SelectElement("zeebe:loopCharacteristics/@outputElement"); e != nil {
					el.Iteration.CollateFrom = e.InnerText()
				}
				if e := x.SelectElement("zeebe:loopCharacteristics/@outputElement"); e != nil {
					el.Iteration.CollateFrom = e.InnerText()
				}
				if e := x.SelectElement("../bpmn:completionCondition"); e != nil {
					el.Iteration.CollateFrom = e.InnerText()
				}
			}

		}
	case *model.CatchError:
		if x := i.SelectElement("bpmn:extensionElements"); x != nil {
			if e := x.SelectElement("zeebe:ioMapping"); e != nil {
				if o := e.SelectElements("zeebe:output"); o != nil {
					el.OutputTransform = make(map[string]string)
					for _, j := range o {
						el.OutputTransform[j.SelectAttr("target")] = j.SelectAttr("source")
					}
				}
			}
		}
	case *model.Timer:
		if x := i.SelectElement("bpmn:extensionElements"); x != nil {
			if e := x.SelectElement("zeebe:ioMapping"); e != nil {
				if o := e.SelectElements("zeebe:output"); o != nil {
					el.OutputTransform = make(map[string]string)
					for _, j := range o {
						el.OutputTransform[j.SelectAttr("target")] = j.SelectAttr("source")
					}
				}
			}
		}
	}
	return nil
}
