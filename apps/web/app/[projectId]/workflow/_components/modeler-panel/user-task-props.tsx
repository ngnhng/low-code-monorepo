"use client";

import {
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
    Label,
    Input,
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@repo/ui";

import { getBusinessObject } from "bpmn-js/lib/util/ModelUtil";
import { useEffect, useState } from "react";
import { Plus } from "react-feather";
import { Trash } from "react-feather";

export default function UserTaskProps({ element, modeler }) {
    const [extensionElements, setExtensionElements] = useState<any>();
    // eslint-disable-next-line no-unused-vars
    const [inputs, setInputs] = useState<any>([]);
    const [output, setOutput] = useState<any>();
    const [formsList, setFormsList] = useState<any>([]);

    useEffect(() => {
        getFormsList();

        const bObject = getBusinessObject(element);
        if (!bObject.extensionElements) return;

        const extensionElements = bObject.extensionElements;
        setExtensionElements(extensionElements);

        const { input, output } = extensionElements.get("values").find((extension: any) => extension.$type === "yalc:IoMapping");

        setInputs(input ?? []);
        setOutput(output[0]);
    }, []);

    const getFormsList = async () => {
        // Do somekind of fetching here
        setFormsList({
            id_1: {
                field_1: "",
                field_2: 1,
                field_3: true,
            },
            id_2: {
                field_4: "",
                field_5: 1,
                field_6: true,
            },
        });
    };

    const setInputData = (value: string, input: any, type: "source" | "target") => {
        const modeling = modeler.get("modeling");

        if (!input) return;
        input[type] = value;

        modeling.updateProperties(element, {
            extensionElements,
        });
    };

    const setOutputData = (value: string, type: "source" | "target") => {
        const modeling = modeler.get("modeling");
        if (!output) return;

        output[type] = value;

        modeling.updateProperties(element, {
            extensionElements,
        });
    };

    const setForm = (value: string) => {
        const modeling = modeler.get("modeling");

        const ioMapping = extensionElements.get("values").find((extension: any) => extension.$type === "yalc:IoMapping");
        ioMapping.get("input").length = 0;

        const moddle = modeler.get("moddle");
        ioMapping.get("input").push(
            ...Object.keys(formsList[value]).map((key) =>
                moddle.create("yalc:Input", {
                    source: key,
                    target: "",
                })
            )
        );

        modeling.updateProperties(element, {
            extensionElements,
        });

        setInputs([...ioMapping.input] ?? []);
        return;
    };

    const removeInput = (idx: number) => {
        const modeling = modeler.get("modeling");
        const ioMapping = extensionElements.get("values").find((extension: any) => extension.$type === "yalc:IoMapping");

        ioMapping.get("input").length = 0;
        ioMapping.get("input").push(...inputs.slice(0, idx), ...inputs.slice(idx + 1));
        setInputs([...ioMapping.input]);

        modeling.updateProperties(element, {
            extensionElements,
        });
    };

    return (
        <AccordionItem value="userTask">
            <AccordionTrigger>User Task Properties</AccordionTrigger>
            <AccordionContent className="flex flex-col p-5 gap-5">
                <Label>Select Form to get data from</Label>
                <Select
                    onValueChange={(value) => {
                        setForm(value);
                    }}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select an action" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {Object.keys(formsList).map((id) => (
                                <SelectItem value={id}>{id}</SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Label>Inputs</Label>
                <div className="w-full flex flex-col gap-5 p-5 bg-slate-100 rounded-md">
                    {inputs.map((input: any, idx: number) => {
                        console.log(idx);
                        return (
                            <div className="flex gap-2.5 items-center" key={`${input.source}-${idx}`}>
                                <div className="flex gap-2.5 w-[60%] items-center">
                                    <Label>Source</Label>
                                    <div className="p-2.5 bg-slate-200 rounded-md flex-1">{input.source}</div>
                                </div>
                                <Label className="w-32">Target</Label>
                                <Input
                                    onBlur={(event) => setInputData(event.target.value, input, "target")}
                                    placeholder="Identifer"
                                    defaultValue={input.target}
                                />
                                <button onClick={() => removeInput(idx)}>
                                    <Trash />
                                </button>
                            </div>
                        );
                    })}
                </div>
                <Label>Output</Label>
                <div className="flex gap-2.5 items-center p-5 bg-slate-100 rounded-md">
                    <Label className="w-32">Source</Label>
                    <Input onBlur={(event) => setOutputData(event.target.value, "source")} placeholder="Expression" defaultValue="" />
                    <Label className="w-32">Target</Label>
                    <Input onBlur={(event) => setOutputData(event.target.value, "target")} placeholder="Expression" defaultValue="" />
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
