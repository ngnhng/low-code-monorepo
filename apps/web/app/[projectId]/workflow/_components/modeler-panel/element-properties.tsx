/* eslint-disable unicorn/no-null */
import { getBusinessObject, is } from "bpmn-js/lib/util/ModelUtil";
import { useEffect, useReducer, useState } from "react";
import { getExtensionElement, hasDefinition } from "helpers/bpmn.helper";
import { QAElementProperties } from "./qa-element-form";
import GoogleSheetProps from "./google-sheet-props";
import GatewayProps from "./gateway-props";
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
} from "@repo/ui";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MoveRight, Trash } from "lucide-react";

const initialState = {
    businessObject: null,
    isQA: false,
    isGS: false,
    isStartEvent: false,
    isSequenceFlow: false,
};

function reducer(state, action) {
    switch (action.type) {
        case "setBusinessObject": {
            return { ...state, businessObject: action.payload };
        }
        case "setIsQA": {
            return { ...state, isQA: action.payload };
        }
        case "disableAll": {
            return { ...state, isQA: false, isGS: false, isStartEvent: false };
        }
        case "setIsGS": {
            return { ...state, isGS: action.payload };
        }
        case "setIsStartEvent": {
            return { ...state, isStartEvent: action.payload };
        }
        case "setIsSequenceFlow": {
            return { ...state, isSequenceFlow: action.payload };
        }
        default: {
            throw new Error(`Unsupported action type: ${action.type}`);
        }
    }
}

export function ElementProperties({ element, modeler }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    const disableAll = () => {
        dispatch({ type: "disableAll" });
    };

    if (element.labelTarget) {
        element = element.labelTarget;
    }

    //   console.log(element, modeler, state);

    useEffect(() => {
        const bObject = getBusinessObject(element);
        dispatch({ type: "setBusinessObject", payload: bObject });

        const { suitable, isGoogleSheet, $type } = bObject;
        const isStartEvent = $type === "bpmn:StartEvent";
        const isGateway = $type === "bpmn:SequenceFlow";

        //console.log("States", suitable, isGoogleSheet, isStartEvent);

        // Disable all at the start
        disableAll();

        if (isStartEvent) {
            handleStartEvent(bObject);
        } else if (suitable) {
            handleSuitable();
        } else if (isGoogleSheet) {
            handleGoogleSheet(bObject);
        } else if (isGateway) {
            handleSequenceFlow(bObject);
        }
    }, [element]);

    const handleSequenceFlow = (bObject: any) => {
        dispatch({ type: "setIsSequenceFlow", payload: true });

        if (bObject.extensionElements) return;

        const moddle = modeler.get("moddle");
        const modeling = modeler.get("modeling");
        const extensionElements = bObject.extensionElements || moddle.create("bpmn:ExtensionElements");

        const condition = moddle.create("yalc:ConditionExpression", {
            // expression: ""
            text: ""
        });

        extensionElements.get("values").push(condition);

        modeling.updateProperties(element, {
            extensionElements,
        });
    };

    const handleStartEvent = (bObject) => {
        dispatch({ type: "setIsStartEvent", payload: true });

        if (bObject.extensionElements) return;

        const moddle = modeler.get("moddle");
        const modeling = modeler.get("modeling");
        const extensionElements = bObject.extensionElements || moddle.create("bpmn:ExtensionElements");

        const ioMapping = moddle.create("yalc:IoMapping");
        extensionElements.get("values").push(ioMapping);

        modeling.updateProperties(element, {
            extensionElements,
        });
    };

    const handleSuitable = () => {
        dispatch({ type: "setIsQA", payload: true });
    };

    const handleGoogleSheet = (bObject) => {
        dispatch({ type: "setIsGS", payload: true });

        if (bObject.extensionElements) return;

        const moddle = modeler.get("moddle");
        const modeling = modeler.get("modeling");
        const extensionElements = bObject.extensionElements || moddle.create("bpmn:ExtensionElements");

        // Name of the handle function
        const taskDefinition = moddle.create("yalc:TaskDefinition", {
            type: "getData",
        });

        const ioMapping = moddle.create("yalc:IoMapping");
        const defaultInput = moddle.create("yalc:Input", {
            source: "=_globalContext_user",
            target: "_localContext_user",
        });
        const sheetIdInput = moddle.create("yalc:Input", {
            source: "sheetId",
            target: "",
        });
        const sheetDataInput = moddle.create("yalc:Input", {
            source: "sheetData",
            target: "",
        });
        const rangeInput = moddle.create("yalc:Input", {
            source: "range",
            target: "",
        });
        const output = moddle.create("yalc:Output", {
            source: "sheetData",
            target: "",
        });
        ioMapping.get("input").push(defaultInput, sheetIdInput, sheetDataInput, rangeInput);
        ioMapping.get("output").push(output);

        extensionElements.get("values").push(taskDefinition, ioMapping);

        modeling.updateProperties(element, {
            extensionElements,
        });
    };

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
        const bpmnReplace = modeler.get("bpmnReplace");
        bpmnReplace.replaceElement(element, {
            type: element.businessObject.$type,
            eventDefinitionType: "bpmn:MessageEventDefinition",
        });
    };

    const makeServiceTask = (/* name */) => {
        const bpmnReplace = modeler.get("bpmnReplace");
        bpmnReplace.replaceElement(element, {
            type: "bpmn:ServiceTask",
        });
    };

    const attachTimeout = () => {
        const modeling = modeler.get("modeling");
        // const autoPlace = modeler.get('autoPlace');
        const selection = modeler.get("selection");

        const attrs = {
            type: "bpmn:BoundaryEvent",
            eventDefinitionType: "bpmn:TimerEventDefinition",
        };

        const position = {
            x: element.x + element.width,
            y: element.y + element.height,
        };

        const boundaryEvent = modeling.createShape(attrs, position, element, {
            attach: true,
        });
        const taskShape = append(boundaryEvent, {
            type: "bpmn:Task",
        });

        selection.select(taskShape);
    };

    const isTimeoutConfigured = (element) => {
        const attachers = element.attachers || [];
        return attachers.some((e) => hasDefinition(e, "bpmn:TimerEventDefinition"));
    };

    const append = (element, attrs) => {
        const autoPlace = modeler.get("autoPlace");
        const elementFactory = modeler.get("elementFactory");
        const shape = elementFactory.createShape(attrs);
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
                                <p className="text-sm text-gray-500">{getElementName(element)}</p>
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
                {state.isGS ? <GoogleSheetProps element={element} modeler={modeler} /> : ""}
                {state.isStartEvent && (
                    <AccordionItem value="startEvent">
                        <AccordionTrigger>I/O</AccordionTrigger>
                        <AccordionContent>
                            <OutputProperties element={element} modeler={modeler} />
                        </AccordionContent>
                    </AccordionItem>
                )}
                {state.isSequenceFlow ? <GatewayProps element={element} modeler={modeler} /> : ""}
                <AccordionItem value="actions">
                    <AccordionTrigger>Actions</AccordionTrigger>
                    <AccordionContent>
                        <div className="flex flex-col gap-1">
                            {is(element, "bpmn:Task") && !is(element, "bpmn:ServiceTask") && (
                                <Button onClick={makeServiceTask}>Make Service Task</Button>
                            )}
                            {is(element, "bpmn:Event") && !hasDefinition(element, "bpmn:MessageEventDefinition") && (
                                <Button onClick={makeMessageEvent}>Make Message Event</Button>
                            )}

                            {is(element, "bpmn:Task") && !isTimeoutConfigured(element) && <Button onClick={attachTimeout}>Attach Timeout</Button>}
                        </div>
                    </AccordionContent>
                </AccordionItem>
                {is(element, "bpmn:Event") ? (
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
                    ""
                )}
            </Accordion>
        </div>
    );
}

const getElementName = (element) => {
    return element.businessObject.name || "No name";
};

const getElementType = (element) => {
    return element.businessObject.$type;
};

// TODO: move to separate file
const OutputProperties = ({ element, modeler }) => {
    // entered outputs
    const [outputs, setOutputs] = useState<any>([]);

    const businessObject = getBusinessObject(element);
    const moddle = modeler.get("moddle");
    const modeling = modeler.get("modeling");

    const onSubmit = (data) => {
        const { source, target } = data;

        const extensionElements = businessObject.get("extensionElements");

        const values = moddle.create("yalc:output", { source, target });

        const ioMapping = getExtensionElement(businessObject, "yalc:ioMapping");
        ioMapping.get("output").push(values);
        setOutputs([...outputs, { source, target }]);

        //extensionElements.get('values').push(ioMapping);
        modeling.updateProperties(element, {
            extensionElements,
        });
    };

    useEffect(() => {
        const extensionElements = businessObject.get("extensionElements");
        if (!extensionElements) return;

        const ioMapping = getExtensionElement(businessObject, "yalc:ioMapping");
        if (!ioMapping) return;

        setOutputs(
            ioMapping.get("output").map(({ source, target }) => {
                return {
                    source,
                    target,
                };
            })
        );
    }, []);

    const handleRemove = (index) => {
        const extensionElements = businessObject.get("extensionElements");
        const ioMapping = getExtensionElement(businessObject, "yalc:ioMapping");
        const values = ioMapping.get("output");
        if (!values) return;

        values.splice(index, 1);
        // if all outputs are removed, remove ioMapping
        // if (values.length === 0) {
        //     extensionElements.get("values").splice(extensionElements.get("values").indexOf(ioMapping), 1);
        // }

        modeling.updateProperties(element, {
            extensionElements,
        });
        setOutputs(outputs.filter((_, i) => i !== index));
    };

    return (
        <div>
            <h2>Output Mapping</h2>
            <div className="flex flex-col gap-5 p-5">
                <div>
                    <h3>Outputs</h3>
                    <ul className="space-y-2">
                        {outputs.map((output, index) => (
                            <li key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded shadow">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-700">{output.source}</span>
                                    <MoveRight />
                                    <span className="text-gray-500">{output.target}</span>
                                </div>
                                <button
                                    onClick={() => handleRemove(index)}
                                    className="p-2 rounded hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
                                >
                                    <Trash color="#f54254" size={18} /> {/* Trash bin icon */}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="flex flex-col gap-5 p-5">
                <OutputForm onSubmit={onSubmit} />
            </div>
        </div>
    );
};

// TODO: add more restrictions (no _ at the beginning, no spaces, etc.)
const formSchema = z.object({
    source: z.string(),
    target: z.string(),
});

const OutputForm = ({ onSubmit }) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            source: "",
            target: "",
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5" autoComplete="off">
                <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Source</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormDescription>Source of the output</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="target"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Target</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormDescription>Target of the output</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Add Output</Button>
            </form>
        </Form>
    );
};
