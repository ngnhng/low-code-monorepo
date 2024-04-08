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

export default function UserTaskProps({ element, modeler }) {
    const [extensionElements, setExtensionElements] = useState<any>();
    const [formId, setFormId] = useState<any>();
    const [formsList, setFormsList] = useState<any>({});
    // eslint-disable-next-line no-unused-vars
    const [inputs, setInputs] = useState<any>([]);
    const [output, setOutput] = useState<any>();

    const getFormsList = async () => {
        // Do somekind of fetching here
        setFormsList({
            id_1: {
                field_1: "",
                field_2: 1,
                field_3: true,
            },
            id_2: {
                field_1: "",
                field_2: 1,
                field_3: true,
            },
        });
    };

    useEffect(() => {
        const bObject = getBusinessObject(element);
        if (!bObject.extensionElements) return;

        const extensionElements = bObject.extensionElements;
        setExtensionElements(extensionElements);

        const { formId } = extensionElements.get("values").find((extension: any) => extension.$type === "yalc:FormDefinition");
        const { input, output } = extensionElements.get("values").find((extension: any) => extension.$type === "yalc:IoMapping");

        setFormId(formId);
        setInputs(input ?? []);
        setOutput(output[0]);

        getFormsList();
    }, []);

    const setInputTarget = (value: string, input: any, type: "source" | "target") => {
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
        setFormId(value);
        return;
    };

    return (
        <AccordionItem value="gs">
            <AccordionTrigger>User Task Properties</AccordionTrigger>
            <AccordionContent className="flex flex-col p-5 gap-5">
                <Label>Select Form to get data from</Label>
                <Select
                    onValueChange={(value) => {
                        setForm(value);
                    }}
                    defaultValue={formId}
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
                <div className="flex justify-between">
                    <Label>Inputs</Label>
                </div>
                <div className="w-full flex flex-col gap-5 p-5 bg-slate-100 rounded-md">
                    {inputs.map((input: any) => {
                        return (
                            <div className="flex gap-2.5 items-center" key={input.source}>
                                <Label className="w-32">{input.source}</Label>
                                <Input
                                    onBlur={(event) => {
                                        setInputTarget(event.target.value, input, "target");
                                    }}
                                    placeholder="Expression"
                                    defaultValue={input.target}
                                />
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
