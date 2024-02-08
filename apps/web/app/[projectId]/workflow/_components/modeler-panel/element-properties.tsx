import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import { useState, useEffect, useReducer } from 'react';
import { hasDefinition } from 'helpers/bpmn.helper';
import { QAElementProperties } from './qa-element-form';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@repo/ui';

const initialState = {
  businessObject: null,
  isQA: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'setBusinessObject': {
      return { ...state, businessObject: action.payload };
    }
    case 'setIsQA': {
      return { ...state, isQA: action.payload };
    }
    case 'disableAll': {
      return { ...state, isQA: false };
    }
    default: {
      throw new Error(`Unsupported action type: ${action.type}`);
    }
  }
}

export function ElementProperties({ element, modeler }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const disableAll = () => {
    dispatch({ type: 'disableAll' });
  };

  if (element.labelTarget) {
    element = element.labelTarget;
  }

  useEffect(() => {
    const bObject = getBusinessObject(element);
    //console.log(bObject);
    dispatch({ type: 'setBusinessObject', payload: bObject });

    const { suitable } = bObject;
    if (suitable) {
      disableAll();
      dispatch({ type: 'setIsQA', payload: true });
    }
  }, [element]);

  const updateName = (name) => {
    const modeling = modeler.get('modeling');
    modeling.updateLabel(element, name);
  };

  const updateTopic = (topic) => {
    const modeling = modeler.get('modeling');
    modeling.updateProperties(element, {
      'custom:topic': topic,
    });
  };

  const makeMessageEvent = () => {
    const bpmnReplace = modeler.get('bpmnReplace');
    bpmnReplace.replaceElement(element, {
      type: element.businessObject.$type,
      eventDefinitionType: 'bpmn:MessageEventDefinition',
    });
  };

  const makeServiceTask = (name) => {
    const bpmnReplace = modeler.get('bpmnReplace');
    bpmnReplace.replaceElement(element, {
      type: 'bpmn:ServiceTask',
    });
  };

  const attachTimeout = () => {
    const modeling = modeler.get('modeling');
    const autoPlace = modeler.get('autoPlace');
    const selection = modeler.get('selection');

    const attrs = {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:TimerEventDefinition',
    };

    const position = {
      x: element.x + element.width,
      y: element.y + element.height,
    };

    const boundaryEvent = modeling.createShape(attrs, position, element, {
      attach: true,
    });
    const taskShape = append(boundaryEvent, {
      type: 'bpmn:Task',
    });

    selection.select(taskShape);
  };

  const isTimeoutConfigured = (element) => {
    const attachers = element.attachers || [];
    return attachers.some((e) => hasDefinition(e, 'bpmn:TimerEventDefinition'));
  };

  const append = (element, attrs) => {
    const autoPlace = modeler.get('autoPlace');
    const elementFactory = modeler.get('elementFactory');
    var shape = elementFactory.createShape(attrs);
    return autoPlace.append(element, shape);
  };

  return (
    <div key={element.id} className="p-4 h-full bg-white shadow">
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="general">
          <AccordionTrigger>General</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-row justify-between">
              <div>
                <h2 className="text-xl font-bold">{getElementType(element)}</h2>
                <p className="text-sm text-gray-500">
                  {getElementName(element)}
                </p>
                <p className="text-sm text-gray-500">{element.id}</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        {state.isQA && (
          <AccordionItem value="qa">
            <AccordionTrigger>QA</AccordionTrigger>
            <AccordionContent>
              <QAElementProperties element={element} modeler={modeler} />
            </AccordionContent>
          </AccordionItem>
        )}
        <AccordionItem value="actions">
          <AccordionTrigger>Actions</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col">
              {is(element, 'bpmn:Task') && !is(element, 'bpmn:ServiceTask') && (
                <button className="ml-2" onClick={makeServiceTask}>
                  Make Service Task
                </button>
              )}
              {is(element, 'bpmn:Event') &&
                !hasDefinition(element, 'bpmn:MessageEventDefinition') && (
                  <button className="ml-2" onClick={makeMessageEvent}>
                    Make Message Event
                  </button>
                )}

              {is(element, 'bpmn:Task') && !isTimeoutConfigured(element) && (
                <button className="ml-2" onClick={attachTimeout}>
                  Attach Timeout
                </button>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

const getElementName = (element) => {
  return element.businessObject.name || 'No name';
};

const getElementType = (element) => {
  return element.businessObject.$type;
};
