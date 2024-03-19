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
import { Plus } from "lucide-react";
import { getBusinessObject } from "bpmn-js/lib/util/ModelUtil";
import { useEffect, useState } from "react";

export default function GoogleSheetProps({ element, modeler }) {
    const [extensionElements, setExtensionElements] = useState<any>();
    // eslint-disable-next-line no-unused-vars
    const [type, setType] = useState<any>();
    const [inputs, setInputs] = useState<any>([]);
    const [output, setOutput] = useState<any>();

    useEffect(() => {
        const bObject = getBusinessObject(element);
        if (!bObject.extensionElements) return;

        const extensionElements = bObject.extensionElements;
        setExtensionElements(extensionElements);

        const { input: ioMapping, output } = extensionElements.get("values").find((extension: any) => extension.$type === "yalc:ioMapping");

        setInputs(ioMapping.filter((input: any) => input.source !== "=_globalContext_user"));
        setOutput(output);
    }, []);

    const setInputSource = (value: string) => {
        const modeling = modeler.get("modeling");
        const { ioMapping } = extensionElements.get("values").find((extension: any) => extension.ioMapping);

        console.log(ioMapping);
        if (!ioMapping) return;

        const input = ioMapping.find((input: any) => input.source !== "=_globalContext_user");

        for (const input in ioMapping.filter((input: any) => input.source !== "=_globalContext_user")) {
            setInputs([...inputs, input]);
        }

        console.log(input);
        if (!input) return;

        input.source = value;

        modeling.updateProperties(element, {
            extensionElements,
        });
    };

    const setInputTarget = (value: string, source: string) => {
        const modeling = modeler.get("modeling");
        const { input: ioMapping } = extensionElements.get("values").find((extension: any) => extension.$type === "yalc:ioMapping");

        console.log(ioMapping);
        if (!ioMapping) return;

        const input = ioMapping.find((input: any) => input.source === source);

        console.log(input);
        if (!input) return;

        input.target = value;

        modeling.updateProperties(element, {
            extensionElements,
        });
    };

    const setOutputTarget = (value: string) => {
        const modeling = modeler.get("modeling");
        const { output: outputArray } = extensionElements.get("values").find((extension: any) => extension.$type === "yalc:ioMapping");

        console.log(output);
        if (!output) return;

        outputArray[0].target = value;

        modeling.updateProperties(element, {
            extensionElements,
        });
    };

    const setFunctionType = (value: string) => {
        const fnEnum = {
            getData: "googleSheetGetData",
            add: "googleSheetAddRow",
            remove: "googleSheetRemoveRow",
        };

        const modeling = modeler.get("modeling");
        const definition = extensionElements.get("values").find((extension: any) => extension.type);

        console.log(definition);
        if (!definition) return;

        definition.type = fnEnum[value] ?? "";

        modeling.updateProperties(element, {
            extensionElements,
        });
    };

    const addInput = () => {
        const modeling = modeler.get("modeling");
        const { ioMapping } = extensionElements.get("values").find((extension: any) => extension.ioMapping);

        console.log(ioMapping);
        if (!ioMapping) return;

        const moddle = modeler.get("moddle");
        const input = moddle.create("yalc:input", {
            source: "",
            target: "",
        });
        ioMapping.push(input);

        modeling.updateProperties(element, {
            extensionElements,
        });

        setInputs([]);
        for (const input in ioMapping.filter((input: any) => input.source !== "=_globalContext_user")) {
            setInputs([...inputs, input]);
        }
    };

    return (
        <AccordionItem value="gs">
            <AccordionTrigger>Google Sheet Properties</AccordionTrigger>
            <AccordionContent className="flex flex-col p-5 gap-5">
                <Label>Select action</Label>
                <Select
                    onValueChange={(value) => {
                        setFunctionType(value);
                    }}
                    defaultValue="getData"
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select an action" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="getData">Get Data Range</SelectItem>
                            <SelectItem value="add">Add Row</SelectItem>
                            <SelectItem value="remove">Remove Row</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <div className="flex justify-between">
                    <Label>Inputs</Label>
                    {/* <button onClick={() => addInput()}>
                        <Plus />
                    </button> */}
                </div>
                <div className="w-full flex flex-col gap-5 p-5 bg-slate-100 rounded-md">
                    {inputs.map((input: any) => {
                        return (
                            <div className="flex gap-2.5 items-center" key={input.source}>
                                <Label className="w-32">{input.source}</Label>
                                <Input
                                    onBlur={(event) => {
                                        setInputTarget(event.target.value, input.source);
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
                    <Label className="w-32">sheetData</Label>
                    <Input
                        onBlur={(event) => {
                            setOutputTarget(event.target.value);
                        }}
                        placeholder="Expression"
                        defaultValue=""
                    />
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
