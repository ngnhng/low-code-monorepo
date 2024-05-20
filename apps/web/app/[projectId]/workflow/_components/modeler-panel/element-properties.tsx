/* eslint-disable unicorn/no-null */
import { getBusinessObject, is } from "bpmn-js/lib/util/ModelUtil";
import { useEffect, useReducer, useState } from "react";
import { getExtensionElement, hasDefinition } from "helpers/bpmn.helper";
import { QAElementProperties } from "./qa-element-form";
import GoogleSheetProps from "./google-sheet-props";
import GatewayProps from "./gateway-props";
import UserTaskProps from "./user-task-props";
import MailServiceProps from "./mail-service-props";
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
    SelectLabel,
} from "@repo/ui";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MoveRight, Trash } from "lucide-react";
import { useMobxStore } from "../../../../../lib/mobx/store-provider";
import useSWR from "swr";
import { observer } from "mobx-react-lite";
import { toJS } from "mobx";
import { toast } from "sonner";

const initialState = {
    businessObject: null,
    isQA: false,
    isGS: false,
    isMailService: false,
    isStartEvent: false,
    isSequenceFlow: false,
    isUserTask: false,
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
            return {
                ...state,
                isQA: false,
                isGS: false,
                isMailService: false,
                isStartEvent: false,
                isSequenceFlow: false,
                isUserTask: false,
            };
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
        case "setIsUserTask": {
            return { ...state, isUserTask: action.payload };
        }
        case "setIsMailService": {
            return { ...state, isMailService: action.payload };
        }
        default: {
            throw new Error(`Unsupported action type: ${action.type}`);
        }
    }
}

const getObjectType = (bObject) => {
    const { suitable, isGoogleSheet, $type, isMailService } = bObject;

    if ($type === "bpmn:StartEvent") return "startEvent";
    if (suitable) return "suitable";
    if (isGoogleSheet) return "googleSheet";
    if ($type === "bpmn:SequenceFlow") return "gateway";
    if ($type === "bpmn:UserTask") return "userTask";
    if (isMailService) return "mailService";

    return null;
};

export const ElementProperties = ({ element, modeler }) => {
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

        const objectType = getObjectType(bObject);

        // Disable all at the start
        disableAll();

        switch (objectType) {
            case "startEvent": {
                handleStartEvent(bObject);
                break;
            }
            case "suitable": {
                handleSuitable();
                break;
            }
            case "googleSheet": {
                handleGoogleSheet(bObject);
                break;
            }
            case "gateway": {
                handleSequenceFlow();
                break;
            }
            case "userTask": {
                handleUserTask(bObject);
                break;
            }
            case "mailService": {
                handleMailServiceTask(bObject);
                break;
            }
            default: {
                break;
            }
        }
    }, [element]);

    const handleMailServiceTask = (bObject: any) => {
        dispatch({ type: "setIsMailService", payload: true });

        if (bObject.extensionElements) return;

        const moddle = modeler.get("moddle");
        const modeling = modeler.get("modeling");
        const extensionElements =
            bObject.extensionElements ||
            moddle.create("bpmn:ExtensionElements");
        const ioMapping = moddle.create("yalc:IoMapping");

        // Name of the handle function
        const taskDefinition = moddle.create("yalc:TaskDefinition", {
            type: "mailersendSendMail",
        });

        const apiKey = moddle.create("yalc:Input", {
            source: "",
            target: "apiKey",
        });

        const subject = moddle.create("yalc:Input", {
            source: "",
            target: "mailSubject",
        });

        const text = moddle.create("yalc:Input", {
            source: "",
            target: "mailText",
        });

        const mailToName = moddle.create("yalc:Input", {
            source: "",
            target: "receiverName",
        });

        const mailToEmail = moddle.create("yalc:Input", {
            source: "",
            target: "receiverEmail",
        });

        const output = moddle.create("yalc:Output", {
            source: "=mailSent",
            target: "mailSent",
        });

        ioMapping
            .get("input")
            .push(apiKey, subject, text, mailToName, mailToEmail);
        ioMapping.get("output").push(output);

        extensionElements.get("values").push(taskDefinition, ioMapping);

        modeling.updateProperties(element, {
            extensionElements,
        });
    };

    const handleUserTask = (bObject: any) => {
        dispatch({ type: "setIsUserTask", payload: true });

        if (bObject.extensionElements) return;

        const moddle = modeler.get("moddle");
        const modeling = modeler.get("modeling");
        const extensionElements =
            bObject.extensionElements ||
            moddle.create("bpmn:ExtensionElements");
        const ioMapping = moddle.create("yalc:IoMapping");
        const output = moddle.create("yalc:Output", {
            source: "",
            target: "",
        });

        ioMapping.get("output").push(output);

        extensionElements.get("values").push(ioMapping);

        modeling.updateProperties(element, {
            extensionElements,
        });
    };

    const handleSequenceFlow = () => {
        dispatch({ type: "setIsSequenceFlow", payload: true });

        //if (bObject.extensionElements) return;

        //const moddle = modeler.get("moddle");
        //const modeling = modeler.get("modeling");
        //const extensionElements = bObject.extensionElements || moddle.create("bpmn:ExtensionElements");

        ////const condition = moddle.create("yalc:ConditionExpression", {
        ////    // expression: ""
        ////    text: "",
        ////});

        ////extensionElements.get("values").push(condition);

        //modeling.updateProperties(element, {
        //    extensionElements,
        //});
    };

    const handleStartEvent = (bObject) => {
        dispatch({ type: "setIsStartEvent", payload: true });

        if (bObject.extensionElements) return;

        const moddle = modeler.get("moddle");
        const modeling = modeler.get("modeling");
        const extensionElements =
            bObject.extensionElements ||
            moddle.create("bpmn:ExtensionElements");

        const ioMapping = moddle.create("yalc:IoMapping");
        // add _globalContext_user to global context
        const defaultOutput = moddle.create("yalc:Output", {
            source: "=_globalContext_user",
            target: "_globalContext_user",
        });
        ioMapping.get("output").push(defaultOutput);

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
        const extensionElements =
            bObject.extensionElements ||
            moddle.create("bpmn:ExtensionElements");

        // Name of the handle function
        const taskDefinition = moddle.create("yalc:TaskDefinition", {
            type: "googleSheetReadRange",
        });

        const ioMapping = moddle.create("yalc:IoMapping");
        const defaultInput = moddle.create("yalc:Input", {
            source: "=_globalContext_user",
            target: "_localContext_user",
        });
        const sheetIdInput = moddle.create("yalc:Input", {
            source: "",
            target: "sheetId",
        });
        const sheetDataInput = moddle.create("yalc:Input", {
            source: "",
            target: "sheetData",
        });
        const rangeInput = moddle.create("yalc:Input", {
            source: "",
            target: "range",
        });
        const output = moddle.create("yalc:Output", {
            source: "=sheetData",
            target: "",
        });
        ioMapping
            .get("input")
            .push(defaultInput, sheetIdInput, sheetDataInput, rangeInput);
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
        return attachers.some((e) =>
            hasDefinition(e, "bpmn:TimerEventDefinition")
        );
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
                                <h2 className="text-xl font-bold">
                                    {getElementType(element)}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {getElementName(element)}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {element.id}
                                </p>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                {state.isQA && (
                    <AccordionItem value="qa">
                        <AccordionTrigger>QA</AccordionTrigger>
                        <AccordionContent>
                            <QAElementProperties
                                element={element}
                                modeler={modeler}
                            />
                        </AccordionContent>
                    </AccordionItem>
                )}
                {state.isGS ? (
                    <GoogleSheetProps element={element} modeler={modeler} />
                ) : (
                    ""
                )}
                {state.isStartEvent && (
                    <AccordionItem value="startEvent">
                        <AccordionTrigger>I/O</AccordionTrigger>
                        <AccordionContent>
                            <OutputProperties
                                element={element}
                                modeler={modeler}
                            />
                        </AccordionContent>
                    </AccordionItem>
                )}
                {state.isSequenceFlow ? (
                    <GatewayProps element={element} modeler={modeler} />
                ) : (
                    ""
                )}
                {state.isUserTask ? (
                    <UserTaskProps element={element} modeler={modeler} />
                ) : (
                    ""
                )}
                {state.isMailService ? (
                    <MailServiceProps element={element} modeler={modeler} />
                ) : (
                    ""
                )}
                <AccordionItem value="actions">
                    <AccordionTrigger>Actions</AccordionTrigger>
                    <AccordionContent>
                        <div className="flex flex-col gap-1">
                            {is(element, "bpmn:Task") &&
                                !is(element, "bpmn:ServiceTask") && (
                                    <Button onClick={makeServiceTask}>
                                        Make Service Task
                                    </Button>
                                )}
                            {is(element, "bpmn:Event") &&
                                !hasDefinition(
                                    element,
                                    "bpmn:MessageEventDefinition"
                                ) && (
                                    <Button onClick={makeMessageEvent}>
                                        Make Message Event
                                    </Button>
                                )}

                            {is(element, "bpmn:Task") &&
                                !isTimeoutConfigured(element) && (
                                    <Button onClick={attachTimeout}>
                                        Attach Timeout
                                    </Button>
                                )}
                        </div>
                    </AccordionContent>
                </AccordionItem>
                {is(element, "bpmn:Event") ? (
                    <AccordionItem value="link">
                        <AccordionTrigger>Behaviour</AccordionTrigger>
                        <AccordionContent>
                            <FormSelector element={element} modeler={modeler} />
                        </AccordionContent>
                    </AccordionItem>
                ) : (
                    ""
                )}
            </Accordion>
        </div>
    );
};

const FormSelector = observer(
    ({ element, modeler }: { element: any; modeler: any }) => {
        const {
            projectData: {
                currentProjectId,
                getProjectById,
                views,
                updateViewComponentWorkflowId,
            },
            workflow: { currentWorkflowId },
            tableData: { tables, fetchTables },
        } = useMobxStore();

        //const [ui, setUi] = useState<any>(null);
        //const [component, setComponent] = useState<any>(null);
        //const [tableId, setTableId] = useState<any>(null);

        const bObject = getBusinessObject(element);

        useSWR<any>(["view", currentProjectId], () =>
            getProjectById(currentProjectId)
        );

        useSWR<any>(["tables", currentProjectId], () => fetchTables());

        const uiViews = toJS(views);

        const routes = uiViews?.map((view) => {
            const contentForms =
                view.uiData?.content?.filter(
                    (component) =>
                        component.type === "FormTable" &&
                        component.props.tableId
                ) || [];

            const zoneForms = Object.values(view.uiData?.zones || {}).flatMap(
                (zone: any) =>
                    zone.filter(
                        (component) =>
                            component.type === "FormTable" &&
                            component.props.tableId
                    )
            );

            return {
                routes: view.uiData?.route,
                forms: [...contentForms, ...zoneForms],
            };
        });

        const formListener = getExtensionElement(bObject, "yalc:FormListener");
        //// if exists, get the ui and component
        //if (formListener) {
        //    setUi(formListener.get("ui"));
        //    setComponent(formListener.get("component"));
        //    setTableId(formListener.get("table"));
        //}

        // based on ui and component, lookup the table id and get table spec

        const handleFormSelect = async (value) => {
            // lookup the route the component/id belongs to and update its workflowId
            const { route, form, table } = JSON.parse(value);
            console.log("Form selected:", route, form, table);

            await updateViewComponentWorkflowId(route, form, currentWorkflowId)
                .then(() => {
                    const moddle = modeler.get("moddle");
                    const modeling = modeler.get("modeling");

                    const extensionElements =
                        bObject.extensionElements ||
                        moddle.create("bpmn:ExtensionElements");

                    // check if form listener already exists
                    const formListener = getExtensionElement(
                        bObject,
                        "yalc:FormListener"
                    );
                    // if exists, modify the form listener
                    if (formListener) {
                        console.log("form listener found", bObject);

                        console.log(element, formListener);
                        //modeling.updateProperties(formListener, {
                        //    component: form,
                        //    ui: route,
                        //    table,
                        //});
                        formListener.component = form;
                        formListener.ui = route;
                        formListener.table = table;

                        console.log("form listener updated", bObject);

                        // remove all yalc:Output elements expect _globalContext_user
                        const ioMapping = getExtensionElement(
                            bObject,
                            "yalc:IoMapping"
                        );
                        ioMapping.get("output").splice(1);

                        // add table columns to output
                        const tableColumns = tables.find(
                            (t) => t.id === table
                        )?.columns;

                        if (tableColumns)
                            for (const column of tableColumns) {
                                if (column.name !== "id") {
                                    const output = moddle.create(
                                        "yalc:Output",
                                        {
                                            source: `=${column.name}`,
                                            target: column.name,
                                        }
                                    );

                                    ioMapping.get("output").push(output);
                                }
                            }

                        modeling.updateProperties(element, {
                            extensionElements,
                        });
                    } else {
                        const newFormListener = moddle.create(
                            "yalc:FormListener",
                            {
                                component: form,
                                ui: route,
                                table,
                            }
                        );

                        // get ioMapping and add table columns
                        const ioMapping = getExtensionElement(
                            bObject,
                            "yalc:IoMapping"
                        );

                        const tableColumns = tables.find(
                            (t) => t.id === table
                        )?.columns;

                        if (tableColumns)
                            for (const column of tableColumns) {
                                if (column.name !== "id") {
                                    const output = moddle.create(
                                        "yalc:Output",
                                        {
                                            source: `=${column.name}`,
                                            target: column.name,
                                        }
                                    );

                                    ioMapping.get("output").push(output);
                                }
                            }

                        // add form listener to first position
                        extensionElements
                            .get("values")
                            .unshift(newFormListener);

                        // add ioMapping to extensionElements
                        //extensionElements.get("values").push(ioMapping);

                        modeling.updateProperties(element, {
                            extensionElements,
                        });
                    }

                    toast.success("Form linked to workflow successfully");
                })
                .catch((error) => {
                    console.log(error);
                    toast.error("Failed to link form to workflow");
                });
        };

        return (
            <div className="flex flex-col gap-5 p-5">
                <Label>Link to a Form:</Label>
                <Select
                    onValueChange={handleFormSelect}
                    defaultValue={
                        formListener
                            ? JSON.stringify({
                                  route: formListener.get("ui"),
                                  form: formListener.get("component"),
                                  table: formListener.get("table"),
                              })
                            : undefined
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select one..." />
                    </SelectTrigger>
                    <SelectContent>
                        {routes?.map((route, index) => (
                            <SelectGroup key={index}>
                                <SelectLabel>{route.routes}</SelectLabel>
                                {route.forms?.length > 0 ? (
                                    route.forms.map((form, formIndex) => (
                                        <SelectItem
                                            disabled={
                                                form.props.workflowId &&
                                                form.props.workflowId !==
                                                    currentWorkflowId
                                            }
                                            key={formIndex}
                                            value={JSON.stringify({
                                                route: route.routes,
                                                form: form.props.id,
                                                table: form.props.tableId,
                                            })}
                                        >
                                            {form.props.formName}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="none" disabled>
                                        No forms available
                                    </SelectItem>
                                )}
                            </SelectGroup>
                        ))}
                    </SelectContent>
                </Select>
                <Button
                    variant="outline"
                    disabled={!formListener}
                    onClick={async () => {
                        await updateViewComponentWorkflowId(
                            formListener.ui,
                            formListener.component,
                            currentWorkflowId
                        )
                            .then(() => {
                                const modeling = modeler.get("modeling");
                                const extensionElements =
                                    bObject.extensionElements;

                                if (formListener) {
                                    extensionElements
                                        .get("values")
                                        .splice(
                                            extensionElements
                                                .get("values")
                                                .indexOf(formListener),
                                            1
                                        );

                                    modeling.updateProperties(element, {
                                        extensionElements,
                                    });

                                    toast.success(
                                        "Form unlinked from workflow"
                                    );
                                }

                                // remove all yalc:Output elements expect _globalContext_user
                                const ioMapping = getExtensionElement(
                                    bObject,
                                    "yalc:IoMapping"
                                );

                                ioMapping.get("output").splice(1);

                                modeling.updateProperties(element, {
                                    extensionElements,
                                });
                            })
                            .catch((error) => {
                                console.log(error);
                                toast.error(
                                    "Failed to unlink form from workflow"
                                );
                            });
                    }}
                >
                    Unlink Form
                </Button>
            </div>
        );
    }
);

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

        const values = moddle.create("yalc:Output", { source, target });

        const ioMapping = getExtensionElement(businessObject, "yalc:IoMapping");
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

        const ioMapping = getExtensionElement(businessObject, "yalc:IoMapping");
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
        const ioMapping = getExtensionElement(businessObject, "yalc:IoMapping");
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
                            <li
                                key={index}
                                className="flex items-center justify-between p-2 bg-gray-100 rounded shadow"
                            >
                                <div className="flex items-center gap-2">
                                    {output.source ===
                                    "_globalContext_user" ? null : (
                                        <div>
                                            <span className="font-medium text-gray-700">
                                                {output.source}
                                            </span>
                                            <MoveRight />
                                            <span className="text-gray-500">
                                                {output.target}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleRemove(index)}
                                    className="p-2 rounded hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
                                >
                                    <Trash color="#f54254" size={18} />{" "}
                                    {/* Trash bin icon */}
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
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-5"
                autoComplete="off"
            >
                <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Source</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormDescription>
                                Source of the output
                            </FormDescription>
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
                            <FormDescription>
                                Target of the output
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Add Output</Button>
            </form>
        </Form>
    );
};
