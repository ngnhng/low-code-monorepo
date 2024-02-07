import React, { useState, useEffect } from 'react';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { set } from 'mobx';

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

interface BpmnElement {
  extensionElements?: any;
}

const QAElementProperties = ({ element, modeler }) => {
  const [businessObject, setBusinessObject] = useState<BpmnElement | null>(
    null,
  );
  const [analysisDetails, setAnalysisDetails] = useState(null);
  const [extensionElements, setExtensionElements] = useState<any>(null);
  const moddle = modeler.get('moddle');
  const modeling = modeler.get('modeling');

  const [score, setScore] = useState('');

  useEffect(() => {
    const bObject = getBusinessObject(element);
    //console.log(bObject);
    setBusinessObject(bObject);

    setExtensionElements(
      bObject.extensionElements || moddle.create('bpmn:ExtensionElements'),
    );

    if (getExtensionElement(bObject, 'qa:AnalysisDetails')) {
      setAnalysisDetails(getExtensionElement(bObject, 'qa:AnalysisDetails'));
    }
  }, [element]);

  if (!businessObject) {
    return <div> Error... </div>;
  }

  if (!analysisDetails && extensionElements) {
    const details = moddle.create('qa:AnalysisDetails');
    setAnalysisDetails(details);

    extensionElements.get('values').push(details);
  }

  const onSubmit = (score) => {
    console.log('score', score);
    modeling.updateProperties(element, {
      extensionElements,
      suitable: Number(score),
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <form className="w-full max-w-sm bg-white rounded shadow-md px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="score"
          >
            Suitability Score
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="score"
            type="number"
            placeholder="Enter score"
            value={score}
            onChange={(e) => setScore(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              onSubmit(score);
            }}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

function ElementProperties({ element, modeler }) {
  const [businessObject, setBusinessObject] = useState(null);
  const [isQA, setIsQA] = useState(false);

  if (element.labelTarget) {
    element = element.labelTarget;
  }

  useEffect(() => {
    const bObject = getBusinessObject(element);
    //console.log(bObject);
    setBusinessObject(bObject);

    const { suitable } = bObject;
    if (suitable) {
      setIsQA(true);
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
    <div key={element.id} className="p-4 bg-white shadow rounded-lg">
      {isQA && <QAElementProperties element={element} modeler={modeler} />}
      {/*<fieldset className="mb-4">
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

      {is(element, 'qa:suitability') && (
        <fieldset className="mb-4">
          <label className="font-bold">Suitability</label>
          <span className="ml-2">{isQA ? 'Yes' : 'No'}</span>
        </fieldset>
      )}

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
      </fieldset>*/}
    </div>
  );
}

function hasDefinition(event, definitionType) {
  const definitions = event.businessObject.eventDefinitions || [];

  return definitions.some((d) => is(d, definitionType));
}

function getExtensionElement(element, type) {
  if (!element || !element.extensionElements) {
    return;
  }

  return element.extensionElements.values.find((extensionElement) => {
    return extensionElement.$instanceOf(type);
  });
}

export default PropertiesView;
// todo
//runtime display => overlay
//need to customize some service task
//link to other part of system => need more design thoughts
