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
    Popover,
    PopoverTrigger,
    PopoverContent,
    Command,
    CommandInput,
    CommandEmpty,
    CommandGroup,
    Separator,
} from "@repo/ui";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, MoveRight, Trash } from "lucide-react";
import { useMobxStore } from "../../../../../lib/mobx/store-provider";
import useSWR from "swr";
import { observer } from "mobx-react-lite";
import { toJS } from "mobx";
import { toast } from "sonner";
import cn from "../../../../../lib";
import {
    formatQuery,
    parseSQL,
    QueryBuilder,
    ValueEditorProps,
} from "react-querybuilder";
import "react-querybuilder/dist/query-builder.css";

const initialState = {
    businessObject: null,
    isQA: false,
    isGS: false,
    isMailService: false,
    isTableService: false,
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
                isTableService: false,
                isErrorEvent: false,
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
        case "setIsTableService": {
            return { ...state, isTableService: action.payload };
        }
        case "setIsErrorEvent": {
            return { ...state, isErrorEvent: action.payload };
        }
        default: {
            throw new Error(`Unsupported action type: ${action.type}`);
        }
    }
}

const getObjectType = (bObject) => {
    console.log("getObjectType", bObject);
    const { suitable, isGoogleSheet, $type, isMailService, isTableService } =
        bObject;

    if ($type === "bpmn:StartEvent") return "startEvent";
    if (suitable) return "suitable";
    if (isGoogleSheet) return "googleSheet";
    if ($type === "bpmn:SequenceFlow") return "gateway";
    if ($type === "bpmn:UserTask") return "userTask";
    if (isMailService) return "mailService";
    if (isTableService) return "tableService";
    //if ($type === "bpmn:BoundaryEvent" && bObject.errorRef) return "errorEvent";

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
            case "tableService": {
                handleTableServiceTask(bObject);
                break;
            }
            //case "errorEvent": {
            //    handleErrorEvent(bObject);
            //    break;
            //}
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

    const handleTableServiceTask = (bObject: any) => {
        // table name selector and a sql query input
        dispatch({ type: "setIsTableService", payload: true });

        if (bObject.extensionElements) return;

        const moddle = modeler.get("moddle");
        const modeling = modeler.get("modeling");
        const extensionElements =
            bObject.extensionElements ||
            moddle.create("bpmn:ExtensionElements");

        // Name of the handle function
        const taskDefinition = moddle.create("yalc:TaskDefinition", {
            type: "tableServiceQuery",
        });

        const ioMapping = moddle.create("yalc:IoMapping");
        const defaultInput = moddle.create("yalc:Input", {
            source: "=_globalContext_user",
            target: "_localContext_user",
        });

        const defaultProjectContext = moddle.create("yalc:Input", {
            source: "=_globalContext_projectId",
            target: "_localContext_projectId",
        });

        const tableNameInput = moddle.create("yalc:Input", {
            source: "",
            target: "tableName",
        });

        // create yalc:RuleGroup for sql query
        //const sqlQueryInput = moddle.create("yalc:RuleGroup", {
        //    id: "sqlQuery",
        //    combinator: "and",
        //    not: false,
        //    rules: [],
        //});

        //const sqlQueryInput = moddle.create("yalc:Input", {
        //    source: "",
        //    target: "sqlQuery",
        //});

        ioMapping
            .get("input")
            .push(defaultInput, defaultProjectContext, tableNameInput);

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

        const defaultProjectContext = moddle.create("yalc:Output", {
            source: "=_globalContext_projectId",
            target: "_globalContext_projectId",
        });

        ioMapping.get("output").push(defaultOutput, defaultProjectContext);

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

    //const makeMessageEvent = () => {
    //    const bpmnReplace = modeler.get("bpmnReplace");
    //    bpmnReplace.replaceElement(element, {
    //        type: element.businessObject.$type,
    //        eventDefinitionType: "bpmn:MessageEventDefinition",
    //    });
    //};

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
                    <>
                        <AccordionItem value="gsio">
                            <AccordionTrigger>Input</AccordionTrigger>
                            <AccordionContent>
                                <InputProperties
                                    element={element}
                                    modeler={modeler}
                                />
                            </AccordionContent>
                        </AccordionItem>
                        <GoogleSheetProps element={element} modeler={modeler} />
                    </>
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
                {state.isTableService ? (
                    <>
                        <AccordionItem value="tablesvcio">
                            <AccordionTrigger>Input</AccordionTrigger>
                            <AccordionContent>
                                <InputProperties
                                    element={element}
                                    modeler={modeler}
                                />
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="tableService">
                            <AccordionTrigger>
                                Table Service Query
                            </AccordionTrigger>
                            <AccordionContent>
                                <TableSelector
                                    element={element}
                                    modeler={modeler}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    </>
                ) : (
                    ""
                )}
                <AccordionItem value="actions">
                    <AccordionTrigger>Actions</AccordionTrigger>
                    <AccordionContent>
                        <div className="flex flex-col gap-4">
                            {is(element, "bpmn:Task") &&
                                !is(element, "bpmn:ServiceTask") && (
                                    <Button onClick={makeServiceTask}>
                                        Make Service Task
                                    </Button>
                                )}
                            {/*{is(element, "bpmn:Event") &&
                                !hasDefinition(
                                    element,
                                    "bpmn:MessageEventDefinition"
                                ) && (
                                    //<div className="flex flex-col gap-1">
                                    //    <Label>Message Event</Label>
                                    //    <Button onClick={makeMessageEvent}>
                                    //        Make Message Event
                                    //    </Button>
                                    //    <Separator className="space-y-4" />
                                    //</div>
                                )}*/}

                            {is(element, "bpmn:Event") &&
                                !hasDefinition(
                                    element,
                                    "bpmn:ErrorEventDefinition"
                                ) && (
                                    <div className="flex flex-col gap-4 items-start">
                                        <MakeErrorEvent
                                            modeler={modeler}
                                            element={element}
                                        />

                                        <CreateError
                                            modeler={modeler}
                                            element={element}
                                        />
                                    </div>
                                )}

                            {is(element, "bpmn:Event") &&
                                hasDefinition(
                                    element,
                                    "bpmn:ErrorEventDefinition"
                                ) && (
                                    <CreateError
                                        modeler={modeler}
                                        element={element}
                                    />
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

const makeErrorEventFormSchema = z.object({
    errorName: z.string(),
    errorCode: z.string(),
});

const CreateError = ({ modeler, element }) => {
    const errors = modeler.get("elementRegistry").filter((element) => {
        return (
            element.type === "bpmn:Error" &&
            element.businessObject.$parent.$type === "bpmn:Definitions"
        );
    });
    const errorRef = element.businessObject.eventDefinitions[0]?.errorRef;
    const currentErrorName = errors.find((error) => error.id === errorRef)
        ?.businessObject.name;
    const currentErrorCode = errors.find((error) => error.id === errorRef)
        ?.businessObject.errorCode;

    const form = useForm<z.infer<typeof makeErrorEventFormSchema>>({
        resolver: zodResolver(makeErrorEventFormSchema),
        defaultValues: {
            errorName: currentErrorName || "",
            errorCode: currentErrorCode || "",
        },
    });

    const onSubmit = async (data) => {
        const moddle = modeler.get("moddle");
        // replace element with error event
        const newError = moddle.create("bpmn:Error", {
            id: `Error_${Math.random().toString(36).slice(2, 11)}`,
            name: data.errorName,
            errorCode: data.errorCode,
        });

        console.log("New Error", newError);

        // if new error, add it to the workflow definitions, push it to last
        if (!errors.some((error) => error.name === data.name)) {
            const definitions = modeler.getDefinitions();
            definitions.get("rootElements")?.push(newError);
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
            >
                <FormField
                    control={form.control}
                    name="errorName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Error Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="errorCode"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Error Code</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <Button>Create Error</Button>
            </form>
        </Form>
    );
};

const MakeErrorEvent = ({ modeler, element }) => {
    const [value, setValue] = useState<string>("");

    // look for all errors in the project (<bpmn:Error)
    const errors = modeler
        .getDefinitions()
        .get("rootElements")
        .filter((e) => {
            return e.$type === "bpmn:Error";
        });

    console.log("MakeErrorEvent", errors, modeler.getDefinitions());

    const makeErrorEvent = () => {
        const bpmnReplace = modeler.get("bpmnReplace");
        const newElement = bpmnReplace.replaceElement(element, {
            type: element.businessObject.$type,
            eventDefinitionType: "bpmn:ErrorEventDefinition",
        });

        console.log(
            "MakeErrorEvent",
            value,
            newElement,
            element.businessObject
        );
        const assignError = errors.find((error) => error.id === value);
        console.log("assignError", assignError);
        // search for bpmn:BoundaryEvent with id of bObj
        const event = modeler.get("elementRegistry").get(newElement.id);
        console.log("event", event);

        // add related attributes to the event def
        const eventDefinition = newElement.businessObject.eventDefinitions[0];
        console.log("eventDefinition", eventDefinition);
        eventDefinition.errorRef = assignError;
        console.log("eventDefinition after assignment", eventDefinition);
    };

    return (
        <div className="flex flex-col gap-4 items-start">
            <Select onValueChange={(value) => setValue(value)}>
                <SelectTrigger>
                    <SelectValue placeholder="Select Global Error Reference" />
                </SelectTrigger>
                <SelectContent>
                    {errors.map((error) => (
                        <SelectItem key={error.id} value={error.id}>
                            {error.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Button
                onClick={() => {
                    makeErrorEvent();
                }}
            >
                Make Error Event
            </Button>
        </div>
    );
};

const TableSelector = observer(
    ({ element, modeler }: { element: any; modeler: any }) => {
        const {
            projectData: { currentProjectId },
            tableData: { fetchTables },
            workflow: { currentWorkflow },
        } = useMobxStore();

        const [open, setOpen] = useState<boolean>(false);

        const { data: tables, isLoading } = useSWR<any>(
            ["tables", currentProjectId],
            () => fetchTables(),
            {
                revalidateOnFocus: false,
            }
        );

        const bObject = getBusinessObject(element);

        const moddle = modeler.get("moddle");
        const modeling = modeler.get("modeling");

        const ioMapping = getExtensionElement(bObject, "yalc:IoMapping");

        // get tableId from yalc:Input and remove the =" " around the tableId
        const tableId = ioMapping
            ?.get("input")[2]
            ?.source?.replace(/="(.*)"/, "$1");

        // get sqlQuery from yalc:Input
        const sqlQueryFormatted = ioMapping
            ?.get("input")[3]
            ?.source?.replace(/="(.*)"/, "$1");

        const [query, setQuery] = useState<any>(
            sqlQueryFormatted ? parseSQL(sqlQueryFormatted) : parseSQL("(1=1)")
        );

        // modify the extension elements
        const handleTableSelect = (value) => {
            console.log("Table selected:", value);
            const extensionElements =
                bObject.extensionElements ||
                moddle.create("bpmn:ExtensionElements");

            // parse selected table id to yalc:Input
            const tableIdInput = moddle.create("yalc:Input", {
                source: `="${value}"`,
                target: "tableId",
            });

            // check if ioMapping already exists
            const ioMapping = getExtensionElement(bObject, "yalc:IoMapping");

            // if exists, update the tableId
            if (ioMapping) {
                ioMapping.get("input")[2] = tableIdInput;
            } else {
                // if not, create a new ioMapping
                const ioMapping = moddle.create("yalc:IoMapping");
                ioMapping.get("input").push(tableIdInput);

                extensionElements.get("values").push(ioMapping);
            }

            modeling.updateProperties(element, {
                extensionElements,
            });
        };

        const handleInputSqlQuery = (value) => {
            console.log("SQL Query:", value);
            setQuery(value);
            const extensionElements =
                bObject.extensionElements ||
                moddle.create("bpmn:ExtensionElements");

            // check if ioMapping already exists
            const ioMapping = getExtensionElement(bObject, "yalc:IoMapping");

            // parse selected table id to yalc:Input
            const sqlQueryInput = moddle.create("yalc:Input", {
                source: `="${formatQuery(value, "sql")}"`,
                target: "sqlQuery",
            });

            if (ioMapping) {
                ioMapping.get("input")[3] = sqlQueryInput;
            } else {
                // if not, create a new ioMapping
                const ioMapping = moddle.create("yalc:IoMapping");
                ioMapping.get("input").push(sqlQueryInput);

                extensionElements.get("values").push(ioMapping);
            }

            modeling.updateProperties(element, {
                extensionElements,
            });

            // update output, we map each column name to the target
            const tableColumns = tables.find((t) => t.id === tableId)?.columns;

            if (tableColumns)
                for (const column of tableColumns) {
                    // check if it already exists
                    const exists = ioMapping
                        .get("output")
                        .some((output) => output.source === `=${column.name}`);

                    if (exists) {
                        const output = ioMapping
                            .get("output")
                            .find(
                                (output) => output.source === `=${column.name}`
                            );

                        output.target = column.name;
                    } else {
                        const output = moddle.create("yalc:Output", {
                            source: `=${column.name}`,
                            target: column.name,
                        });

                        ioMapping.get("output").push(output);
                    }
                }
        };

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(currentWorkflow, "text/xml");
        // Get all yalc:output elements
        // eslint-disable-next-line unicorn/prefer-query-selector
        const outputNodes = xmlDoc.getElementsByTagName("yalc:output");
        const inputTargets: string[] = [];

        // Iterate over the elements and extract the target attribute values
        for (const outputNode of outputNodes) {
            const target = outputNode?.getAttribute("target");
            if (target) {
                // if already exists, skip
                if (inputTargets.includes(target)) continue;
                inputTargets.push(target);
            }
        }

        const ExtendedValueEditor_SelectWithInput = (
            props: ValueEditorProps
        ) => {
            return (
                <div className="flex items-center space-x-2">
                    <Select
                        onValueChange={(value) => {
                            props.handleOnChange(`VAR_${value}`);
                            // add input entry to ioMapping
                            const moddle = modeler.get("moddle");
                            const modeling = modeler.get("modeling");

                            const extensionElements =
                                bObject.extensionElements ||
                                moddle.create("bpmn:ExtensionElements");

                            const ioMapping = getExtensionElement(
                                bObject,
                                "yalc:IoMapping"
                            );

                            // check if it already exists
                            const exists = ioMapping
                                .get("input")
                                .some((input) => input.target === value);

                            if (exists) return;

                            const input = moddle.create("yalc:Input", {
                                source: `=${value}`,
                                target: value,
                            });

                            ioMapping.get("input").push(input);

                            modeling.updateProperties(element, {
                                extensionElements,
                            });
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue>
                                {props.value ?? "Select Variable"}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {inputTargets.map((target, idx) => (
                                <SelectItem key={idx} value={target}>
                                    {target}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input
                        value={props.value}
                        onChange={(e) => {
                            props.handleOnChange(e.target.value);
                        }}
                    />
                </div>
            );
        };

        const outputs = getExtensionElement(bObject, "yalc:IoMapping")?.output;

        const inputValues =
            getExtensionElement(bObject, "yalc:IoMapping")
                ?.input?.map((input) => {
                    if (input.target !== "_localContext_user")
                        return {
                            name: `_VAR_${input.target}`,
                            label: input.target,
                            valueSources: ["field"],
                        };
                })
                .filter(Boolean) || [];

        console.log("TableSelector", tables, tableId, outputs, inputValues);

        if (isLoading) {
            return <div>Loading...</div>;
        }

        return (
            <div className="flex flex-col space-y-4 items-start">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox">
                            {tableId
                                ? tables.find((t) => t.id === tableId)?.label
                                : "Select Table"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <Command>
                            <CommandInput placeholder="Search Table" />
                            <CommandEmpty>No tables found</CommandEmpty>
                            <CommandGroup>
                                {tables.map((table) => (
                                    <Command
                                        key={table.id}
                                        onClick={() => {
                                            handleTableSelect(table.id);
                                            setOpen(false);
                                        }}
                                    >
                                        {table.label}
                                        <CheckIcon
                                            className={cn(
                                                "ml-2 h-4 w-4",
                                                tableId === table.id
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                    </Command>
                                ))}
                            </CommandGroup>
                        </Command>
                    </PopoverContent>
                </Popover>

                <QueryBuilder
                    fields={[
                        ...(tables
                            .find((t) => t.id === tableId)
                            ?.columns.map((column) => {
                                return {
                                    name: column.name,
                                    label: column.label,
                                    inputType:
                                        column.name == "id"
                                            ? "numeric"
                                            : "text",
                                };
                            }) || []),
                        //...inputValues,
                    ]}
                    onQueryChange={(query) => {
                        handleInputSqlQuery(query);
                    }}
                    query={query}
                    controlElements={{
                        valueEditor: ExtendedValueEditor_SelectWithInput,
                    }}
                />
                <Label className="mt-4">SQL Query</Label>
                <pre className="p-2 bg-gray-100 rounded-md overflow-auto">
                    {query ? formatQuery(query, "sql") : ""}
                </pre>

                <Separator />
                <Label>Input:</Label>
                {/* render space to input more  */}
                <InputProperties element={element} modeler={modeler} />

                <Separator />
                <Label>Output:</Label>
                {/* render each output field with input field for each target*/}
                {outputs?.map((output, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <Label>{output.source}</Label>
                        <Input
                            value={output.target}
                            onChange={(e) => {
                                const moddle = modeler.get("moddle");
                                const modeling = modeler.get("modeling");

                                const extensionElements =
                                    bObject.extensionElements ||
                                    moddle.create("bpmn:ExtensionElements");

                                const ioMapping = getExtensionElement(
                                    bObject,
                                    "yalc:IoMapping"
                                );

                                ioMapping.get("output")[index].target =
                                    e.target.value;

                                modeling.updateProperties(element, {
                                    extensionElements,
                                });
                            }}
                        />
                        <Trash
                            onClick={() => {
                                const moddle = modeler.get("moddle");
                                const modeling = modeler.get("modeling");

                                const extensionElements =
                                    bObject.extensionElements ||
                                    moddle.create("bpmn:ExtensionElements");

                                const ioMapping = getExtensionElement(
                                    bObject,
                                    "yalc:IoMapping"
                                );

                                ioMapping.get("output").splice(index, 1);

                                modeling.updateProperties(element, {
                                    extensionElements,
                                });
                            }}
                        />
                    </div>
                ))}
            </div>
        );
    }
);

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
                        component.props.table?.tableId
                ) || [];

            const zoneForms = Object.values(view.uiData?.zones || {}).flatMap(
                (zone: any) =>
                    zone.filter(
                        (component) =>
                            component.type === "FormTable" &&
                            component.props.table?.tableId
                    )
            );

            return {
                routes: view.uiData?.route,
                forms: [...contentForms, ...zoneForms],
            };
        });

        console.log("FormSelector", routes);

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
            const { route, form, table, fields } = JSON.parse(value);
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
                        ioMapping.get("output").splice(2);

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
                                table: table,
                            }
                        );

                        // get ioMapping and add table columns
                        const ioMapping = getExtensionElement(
                            bObject,
                            "yalc:IoMapping"
                        );

                        //const tableColumns = tables.find(
                        //    (t) => t.id === table
                        //)?.columns;

                        //if (tableColumns)
                        for (const field of fields) {
                            const output = moddle.create("yalc:Output", {
                                source: `=${field}`,
                                target: field,
                            });

                            ioMapping.get("output").push(output);
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
                                                table: form.props.table
                                                    ?.tableId,
                                                fields: form.props.table
                                                    ?.enabledFields,
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
        <div className="w-full">
            <h2>Output Mapping</h2>
            <div className="flex flex-col gap-5 p-5">
                <div>
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

const InputProperties = ({ element, modeler }) => {
    // entered inputs
    const [inputs, setInputs] = useState<any>([]);

    const businessObject = getBusinessObject(element);
    const moddle = modeler.get("moddle");
    const modeling = modeler.get("modeling");

    const onSubmit = (data) => {
        const { source, target } = data;

        const extensionElements = businessObject.get("extensionElements");

        const values = moddle.create("yalc:Input", { source, target });

        const ioMapping = getExtensionElement(businessObject, "yalc:IoMapping");
        ioMapping.get("input").push(values);
        setInputs([...inputs, { source, target }]);

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

        setInputs(
            ioMapping.get("input").map(({ source, target }) => {
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
        const values = ioMapping.get("input");
        if (!values) return;

        values.splice(index, 1);
        // if all inputs are removed, remove ioMapping
        // if (values.length === 0) {
        //     extensionElements.get("values").splice(extensionElements.get("values").indexOf(ioMapping), 1);
        // }

        modeling.updateProperties(element, {
            extensionElements,
        });
        setInputs(inputs.filter((_, i) => i !== index));
    };

    return (
        <div className="w-full">
            <h2>Input Mapping</h2>
            <div className="flex flex-col gap-5 p-5">
                <div>
                    <ul className="space-y-2">
                        {inputs.map((input, index) => (
                            <li
                                key={index}
                                className="flex items-center justify-between p-2 bg-gray-100 rounded shadow"
                            >
                                <div className="flex items-center gap-2">
                                    <div>
                                        <span className="font-medium text-gray-700">
                                            {input.source}
                                        </span>
                                        <MoveRight />
                                        <span className="text-gray-500">
                                            {input.target}
                                        </span>
                                    </div>
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
                <InputForm onSubmit={onSubmit} />
            </div>
        </div>
    );
};

const InputForm = ({ onSubmit }) => {
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
                                Source of the input
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
                                Target of the input
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Add Input</Button>
            </form>
        </Form>
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
