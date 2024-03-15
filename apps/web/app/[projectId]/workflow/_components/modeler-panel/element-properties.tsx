/* eslint-disable unicorn/no-null */
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';
import { useEffect, useReducer } from 'react';
import { getExtensionElement, hasDefinition } from 'helpers/bpmn.helper';
import { QAElementProperties } from './qa-element-form';
import GoogleSheetProps from './google-sheet-props';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@repo/ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const initialState = {
  businessObject: null,
  isQA: false,
  isGS: false,
  isStartEvent: false,
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
      return { ...state, isQA: false, isGS: false, isStartEvent: false };
    }
    case 'setIsGS': {
      return { ...state, isGS: action.payload };
    }
	case 'setIsStartEvent': {
	  return { ...state, isStartEvent: action.payload };
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

  //   console.log(element, modeler, state);

  useEffect(() => {
	const bObject = getBusinessObject(element);
	dispatch({ type: 'setBusinessObject', payload: bObject });
  
	const { suitable, isGoogleSheet, $type } = bObject;
	const isStartEvent = $type === 'bpmn:StartEvent'; 
  
	console.log("States", suitable, isGoogleSheet, isStartEvent);
  
	// Disable all at the start
	disableAll();
  
	if (isStartEvent) {
	  handleStartEvent();
	} else if (suitable) {
	  handleSuitable();
	} else if (isGoogleSheet) {
	  handleGoogleSheet(bObject);
	}
  
  }, [element]);

  const handleStartEvent = () => {
	dispatch({ type: 'setIsStartEvent', payload: true });
  }

  const handleSuitable = () => {
	dispatch({ type: 'setIsQA', payload: true });
  }

  const handleGoogleSheet = (bObject) => {
	dispatch({ type: 'setIsGS', payload: true });

	if (bObject.extensionElements) return;
  
	const moddle = modeler.get('moddle');
	const modeling = modeler.get('modeling');
	const extensionElements =
	  bObject.extensionElements || moddle.create('bpmn:ExtensionElements');
  
	// Name of the handle function
	const taskDefinition = moddle.create('yalc:taskDefinition', {
	  type: 'test3',
	});
  
	const ioMapping = moddle.create('yalc:ioMapping');
	const defaultInput = moddle.create('yalc:input', {
	  source: '=_globalContext_user',
	  target: '_localContext_user',
	});
	const input = moddle.create('yalc:input', {
	  source: '',
	  target: '',
	});
	ioMapping.get('input').push(defaultInput, input);
  
	extensionElements.get('values').push(taskDefinition, ioMapping);
  
	modeling.updateProperties(element, {
	  extensionElements,
	});
  }

  // const updateName = (name) => {
  //   const modeling = modeler.get('modeling');
  //   modeling.updateLabel(element, name);
  // };

  // const updateTopic = (topic) => {
  //   const modeling = modeler.get('modeling');
  //   modeling.updateProperties(element, {
  //     'custom:topic': topic,
  //   });
  // };

  const makeMessageEvent = () => {
    const bpmnReplace = modeler.get('bpmnReplace');
    bpmnReplace.replaceElement(element, {
      type: element.businessObject.$type,
      eventDefinitionType: 'bpmn:MessageEventDefinition',
    });
  };

  const makeServiceTask = (/* name */) => {
    const bpmnReplace = modeler.get('bpmnReplace');
    bpmnReplace.replaceElement(element, {
      type: 'bpmn:ServiceTask',
    });
  };

  const attachTimeout = () => {
    const modeling = modeler.get('modeling');
    // const autoPlace = modeler.get('autoPlace');
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
        {state.isGS ? (
          <GoogleSheetProps element={element} modeler={modeler} />
        ) : (
          ''
        )}
		{state.isStartEvent && (
		  <AccordionItem value="startEvent">
			<AccordionTrigger>I/O</AccordionTrigger>
			<AccordionContent>
			  <OutputProperties element={element} modeler={modeler} />
			</AccordionContent>
		  </AccordionItem>
		)}
        <AccordionItem value="actions">
          <AccordionTrigger>Actions</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-1">
              {is(element, 'bpmn:Task') && !is(element, 'bpmn:ServiceTask') && (
                <Button onClick={makeServiceTask}>Make Service Task</Button>
              )}
              {is(element, 'bpmn:Event') &&
                !hasDefinition(element, 'bpmn:MessageEventDefinition') && (
                  <Button onClick={makeMessageEvent}>Make Message Event</Button>
                )}

              {is(element, 'bpmn:Task') && !isTimeoutConfigured(element) && (
                <Button onClick={attachTimeout}>Attach Timeout</Button>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
        {is(element, 'bpmn:Event') ? (
          <AccordionItem value="link">
            <AccordionTrigger>Behaviour Definition</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-5 p-5">
                <Label>Choose a UI element to listen to:</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select one..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="one">ID #1</SelectItem>
                      <SelectItem value="two">ID #2</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>
        ) : (
          ''
        )}
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

// TODO: move to separate file
const OutputProperties = ({ element, modeler }) => {

  const businessObject = getBusinessObject(element);
  const moddle = modeler.get('moddle');
  const modeling = modeler.get('modeling');

  const onSubmit = (data) => {
	const { source, target } = data;
	
	const extensionElements = businessObject.get('extensionElements') || moddle.create('bpmn:ExtensionElements');

	const values = moddle.create('yalc:output', { source, target });

	let ioMapping = getExtensionElement(businessObject, 'yalc:ioMapping');
	if (!ioMapping) {
	  ioMapping = moddle.create('yalc:ioMapping');
	}

	ioMapping.get('output').push(values);
	// if ioMapping already pushed, then it will be updated
	if (extensionElements.get('values').some((e) => e.$type === 'yalc:ioMapping')) {
	  extensionElements.get('values').map((e) => {
		if (e.$type === 'yalc:ioMapping') {
		  e = ioMapping;
		}
	  });
	} else {
	  extensionElements.get('values').push(ioMapping);
	}

	//extensionElements.get('values').push(ioMapping);
	modeling.updateProperties(element, {
	  extensionElements,
	});
  }

  return (
	<div>
	  <h2>Output Mapping</h2>
	  <div className="flex flex-col gap-5 p-5">
		<OutputForm onSubmit={onSubmit} />
	  </div>
	</div>
  );
}

// TODO: add more restrictions (no _ at the beginning, no spaces, etc.)
const formSchema = z.object({
	source: z.string(),
	target: z.string(),
});

const OutputForm = ({ onSubmit }) => {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			source: '',
			target: '',
		},
	})

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-5'>
				<FormField
				control={form.control}
				name='source'
				render={({ field }) => (
					<FormItem>
						<FormLabel>Source</FormLabel>
						<FormControl>
							<Input {...field} />
						</FormControl>
						<FormDescription>Source of the output</FormDescription>
						<FormMessage/>
					</FormItem>
				)}
				/>
				<FormField
				control={form.control}
				name='target'
				render={({ field }) => (
					<FormItem>
						<FormLabel>Target</FormLabel>
						<FormControl>
							<Input {...field} />
						</FormControl>
						<FormDescription>Target of the output</FormDescription>
						<FormMessage/>
					</FormItem>
				)}
				/>
				<Button type='submit'>Add Output</Button>
			</form>
		</Form> 
	);
};