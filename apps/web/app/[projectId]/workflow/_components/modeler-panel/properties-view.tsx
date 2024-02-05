import React, { useState, useEffect } from 'react';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import styles from './styles.module.css';

const PropertiesView = ({ modeler }) => {
  const [selectedElements, setSelectedElements] = useState([]);
  const [element, setElement] = useState(null);

  useEffect(() => {
    const selectionChangedHandler = (e) => {
      setSelectedElements(e.newSelection);
      setElement(e.newSelection[0]);
    };

    const elementChangedHandler = (e) => {
      const { element } = e;
      if (!element || element.id !== element.id) return;
      setElement(element);
    };

    modeler.on('selection.changed', selectionChangedHandler);
    modeler.on('element.changed', elementChangedHandler);

    // Cleanup function to remove event listeners
    return () => {
      modeler.off('selection.changed', selectionChangedHandler);
      modeler.off('element.changed', elementChangedHandler);
    };
  }, [modeler]); // Dependency array ensures effect runs on mount and unmount

  return (
    <div>
      {selectedElements.length === 1 && (
        <ElementProperties modeler={modeler} element={element} />
      )}
      {selectedElements.length === 0 && <span>Please select an element.</span>}
      {selectedElements.length > 1 && (
        <span>Please select a single element.</span>
      )}
    </div>
  );
};

function ElementProperties({ element, modeler }) {
  if (element.labelTarget) {
    element = element.labelTarget;
  }

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
    <div key={element.id} className="p-4 bg-white shadow rounded-lg">
      <fieldset className="mb-4">
        <label className="font-bold">id</label>
        <span className="ml-2">{element.id}</span>
      </fieldset>

      <fieldset className="mb-4">
        <label className="font-bold">name</label>
        <input
          className="ml-2 border rounded p-1"
          value={element.businessObject.name || ''}
          onChange={(event) => {
            updateName(event.target.value);
          }}
        />
      </fieldset>

      {is(element, 'custom:TopicHolder') && (
        <fieldset className="mb-4">
          <label className="font-bold">topic (custom)</label>
          <input
            className="ml-2 border rounded p-1"
            value={element.businessObject.get('custom:topic')}
            onChange={(event) => {
              updateTopic(event.target.value);
            }}
          />
        </fieldset>
      )}

      <fieldset className="mb-4">
        <label className="font-bold">actions</label>

        {is(element, 'bpmn:Task') && !is(element, 'bpmn:ServiceTask') && (
          <button
            className="ml-2 bg-blue-500 text-white rounded p-1"
            onClick={makeServiceTask}
          >
            Make Service Task
          </button>
        )}

        {is(element, 'bpmn:Event') &&
          !hasDefinition(element, 'bpmn:MessageEventDefinition') && (
            <button
              className="ml-2 bg-blue-500 text-white rounded p-1"
              onClick={makeMessageEvent}
            >
              Make Message Event
            </button>
          )}

        {is(element, 'bpmn:Task') && !isTimeoutConfigured(element) && (
          <button
            className="ml-2 bg-blue-500 text-white rounded p-1"
            onClick={attachTimeout}
          >
            Attach Timeout
          </button>
        )}
      </fieldset>
    </div>
  );
}

function hasDefinition(event, definitionType) {
  const definitions = event.businessObject.eventDefinitions || [];

  return definitions.some((d) => is(d, definitionType));
}

export default PropertiesView;
