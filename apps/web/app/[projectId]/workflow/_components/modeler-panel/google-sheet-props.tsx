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

export default function GoogleSheetProps({ element, modeler }) {
    const [extensionElements, setExtensionElements] = useState<any>();
    // eslint-disable-next-line no-unused-vars
    const [type, setType] = useState<any>();
    const [inputs, setInputs] = useState<any>([]);
    const [outputs, setOutputs] = useState<any>([]);

    useEffect(() => {
        const fnEnum = {
            googleSheetReadRange: "getData",
            googleSheetAddRow: "add",
            googleSheetRemoveRow: "remove",
            googleSheetAppendRow: "append",
        };

        const bObject = getBusinessObject(element);
        if (!bObject.extensionElements) return;

        const extensionElements = bObject.extensionElements;
        setExtensionElements(extensionElements);

        const { input: inputMapping, output: outputMapping } = extensionElements
            .get("values")
            .find((extension: any) => extension.$type === "yalc:IoMapping");
        const definition = extensionElements
            .get("values")
            .find((extension: any) => extension.type);

        setInputs(
            inputMapping?.filter(
                (input: any) => input.target !== "_localContext_user"
            ) ?? []
        );
        console.log(outputMapping);
        setOutputs(outputMapping ?? []);
        setType(definition ? fnEnum[definition.type] : "");
    }, []);

    const setInputTarget = (value: string, target: string) => {
        const modeling = modeler.get("modeling");
        const { input: ioMapping } = extensionElements
            .get("values")
            .find((extension: any) => extension.$type === "yalc:IoMapping");

        if (!ioMapping) return;

        const input = ioMapping.find((input: any) => input.target === target);

        if (!input) return;

        input.source = value;

        modeling.updateProperties(element, {
            extensionElements,
        });
    };

    const setOutputTarget = (value: string) => {
        const modeling = modeler.get("modeling");
        const { output: outputArray } = extensionElements
            .get("values")
            .find((extension: any) => extension.$type === "yalc:IoMapping");

        if (!outputs) return;

        outputArray[0].target = value;

        modeling.updateProperties(element, {
            extensionElements,
        });
    };

    const setFunctionType = (value: string) => {
        const fnEnum = {
            getData: "googleSheetReadRange",
            add: "googleSheetAddRow",
            remove: "googleSheetRemoveRow",
            append: "googleSheetAppendRow",
        };

        const modeling = modeler.get("modeling");
        const definition = extensionElements
            .get("values")
            .find(
                (extension: any) => extension.$type === "yalc:TaskDefinition"
            );

        if (!definition) return;

        definition.type = fnEnum[value] ?? "";

        modeling.updateProperties(element, {
            extensionElements,
        });
    };

    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    const addInput = () => {
        const modeling = modeler.get("modeling");
        const { ioMapping } = extensionElements
            .get("values")
            .find((extension: any) => extension.ioMapping);

        if (!ioMapping) return;

        const moddle = modeler.get("moddle");
        const input = moddle.create("yalc:Input", {
            source: "",
            target: "",
        });
        ioMapping.push(input);

        modeling.updateProperties(element, {
            extensionElements,
        });

        setInputs([]);
        for (const input in ioMapping.filter(
            (input: any) => input.source !== "=_globalContext_user"
        )) {
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
                    defaultValue={type}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select an action" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="getData">
                                Get Data Range
                            </SelectItem>
                            <SelectItem value="add">Add Row</SelectItem>
                            <SelectItem value="remove">Remove Row</SelectItem>
                            <SelectItem value="append">Append Row</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <div className="flex justify-between">
                    <Label>Inputs</Label>
                </div>
                <div className="w-full flex flex-col gap-5 p-5 bg-slate-100 rounded-md">
                    {inputs.map((input: any) => {
                        return (
                            <div
                                className="flex gap-2.5 items-center"
                                key={input.target}
                            >
                                <Label className="w-32">{input.target}</Label>
                                <Input
                                    onBlur={(event) => {
                                        setInputTarget(
                                            event.target.value,
                                            input.target
                                        );
                                    }}
                                    placeholder="Expression"
                                    defaultValue={input.source}
                                />
                            </div>
                        );
                    })}
                </div>
                <Label>Outputs</Label>
                <div className="w-full flex flex-col gap-5 p-5 bg-slate-100 rounded-md">
                    {outputs.map((output: any) => {
                        return (
                            <div
                                className="flex gap-2.5 items-center"
                                key={output.target}
                            >
                                <Label className="w-32">{output.source}</Label>
                                <Input
                                    onBlur={(event) => {
                                        setOutputTarget(event.target.value);
                                    }}
                                    placeholder="Expression"
                                    defaultValue={output.target}
                                />
                            </div>
                        );
                    })}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
