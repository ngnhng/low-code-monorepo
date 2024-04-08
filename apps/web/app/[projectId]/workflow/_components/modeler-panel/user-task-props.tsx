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
    const [formDef, setFormDef] = useState<any>();

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

        const formDefinition = extensionElements.get("values").find((extension: any) => extension.$type === "yalc:FormDefinition");
        const { input, output } = extensionElements.get("values").find((extension: any) => extension.$type === "yalc:IoMapping");

        setFormId(formDefinition.formId);
        setInputs(input ?? []);
        setOutput(output[0]);
        setFormDef(formDefinition);

        getFormsList();
    }, []);

    const setInputSource = (value: string, input: any) => {
        const modeling = modeler.get("modeling");

        if (!input) return;
        input.source = value;

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

        setFormId(value);
        formDef.formId = value;

        const ioMapping = extensionElements.get("values").find((extension: any) => extension.$type === "yalc:IoMapping");
        ioMapping.get("input").length = 0;

        const moddle = modeler.get("moddle");
        ioMapping.get("input").push(
            ...Object.keys(formsList[value]).map((key) =>
                moddle.create("yalc:Input", {
                    source: formsList[value][key],
                    target: key,
                })
            )
        );

        modeling.updateProperties(element, {
            extensionElements,
        });

        setInputs(ioMapping.input ?? []);
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
                            <div className="flex gap-2.5 items-center" key={`${formId}/${input.target}`}>
                                <Label className="w-32">{input.target}</Label>
                                <Input
                                    onBlur={(event) => setInputSource(event.target.value, input)}
                                    placeholder="Expression"
                                    defaultValue={input.source}
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
