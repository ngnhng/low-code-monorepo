package parser

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/antchfx/xmlquery"
	"gitlab.com/shar-workflow/shar/model"
)

func parseYalcExtensions(root *xmlquery.Node, modelElement any, node *xmlquery.Node) error {
	switch element := modelElement.(type) {
	case *model.Element:
		if x := node.SelectElement("bpmn:extensionElements"); x != nil {
			//Task Definitions
			if e := x.SelectElement("yalc:taskDefinition/@type"); e != nil {
				element.Execute = e.InnerText()
			}
			if e := x.SelectElement("yalc:taskDefinition/@retries"); e != nil {
				retries, err := strconv.ParseUint(e.InnerText(), 10, 32)
				if err != nil {
					return fmt.Errorf("'retries' parse uint32 conversion error: %w", err)
				}
				element.RetryBehaviour = &model.DefaultTaskRetry{
					Number:          uint32(retries),
					Strategy:        0,
					InitMilli:       0,
					IntervalMilli:   0,
					MaxMilli:        0,
					DefaultExceeded: nil,
				}
			}
			if e := x.SelectElement("yalc:calledElement/@processId"); e != nil {
				element.Execute = e.InnerText()
			}
			if e := x.SelectElement("yalc:calledElement/@processId"); e != nil {
				element.Execute = e.InnerText()
			}
			//Form Definitions
			if fk := x.SelectElement("yalc:formDefinition/@formKey"); fk != nil {
				fullName := strings.Split(fk.InnerText(), ":")
				name := fullName[len(fullName)-1]
				f := root.SelectElement("//yalc:userTaskForm[@id=\"" + name + "\"]").InnerText()
				element.Execute = f
			}

			//Assignment Definition
			if e := x.SelectElement("yalc:assignmentDefinition/@assignee"); e != nil {
				element.Candidates = e.InnerText()
			}

			//Assignment Definition
			if e := x.SelectElement("yalc:assignmentDefinition/@candidateGroups"); e != nil {
				element.CandidateGroups = e.InnerText()
			}

			//Messages
			if e := x.SelectElement("yalc:subscription/@correlationKey"); e != nil {
				element.Execute = e.InnerText()
			}

			//Input/Output
			if e := x.SelectElement("yalc:ioMapping"); e != nil {
				if o := e.SelectElements("yalc:output"); o != nil {
					element.OutputTransform = make(map[string]string)
					for _, j := range o {
						element.OutputTransform[j.SelectAttr("target")] = j.SelectAttr("source")
					}
				}
				if o := e.SelectElements("yalc:input"); o != nil {
					element.InputTransform = make(map[string]string)
					for _, j := range o {
						element.InputTransform[j.SelectAttr("target")] = j.SelectAttr("source")
					}
					// parse special global input with the prefix _globalContext_
					//element.InputTransform["_localContext_user"] = "=_globalContext_user"
				}
			}
			//<yalc:loopCharacteristics inputCollection="=a" inputElement="b" outputCollection="c" outputElement="=d" />
			if e := x.SelectElement("yalc:loopCharacteristics"); e != nil {
				element.Iteration = &model.Iteration{}
				if e := x.SelectElement("yalc:loopCharacteristics/@inputCollection"); e != nil {
					element.Iteration.Collection = e.InnerText()
				}
				if e := x.SelectElement("yalc:loopCharacteristics/@inputElement"); e != nil {
					element.Iteration.Iterator = e.InnerText()
				}
				if e := x.SelectElement("yalc:loopCharacteristics/@outputCollection"); e != nil {
					element.Iteration.CollateAs = e.InnerText()
				}
				if e := x.SelectElement("yalc:loopCharacteristics/@outputElement"); e != nil {
					element.Iteration.CollateFrom = e.InnerText()
				}
				if e := x.SelectElement("yalc:loopCharacteristics/@outputElement"); e != nil {
					element.Iteration.CollateFrom = e.InnerText()
				}
				if e := x.SelectElement("../bpmn:completionCondition"); e != nil {
					element.Iteration.CollateFrom = e.InnerText()
				}
			}

		}
	}
	return nil
}
