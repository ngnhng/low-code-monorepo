"use client";

import {
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
    Label,
    Input,
} from "@repo/ui";
import { getBusinessObject } from "bpmn-js/lib/util/ModelUtil";
import { useEffect, useState } from "react";

export default function GatewayProps({ element, modeler }) {
    const [extensionElements, setExtensionElements] = useState<any>();
    // eslint-disable-next-line no-unused-vars
    const [input, setInput] = useState<any>();
    const [output, setOutput] = useState<any>();

    useEffect(() => {

        const bObject = getBusinessObject(element);
        if (!bObject.extensionElements) return;

        const extensionElements = bObject.extensionElements;
        setExtensionElements(extensionElements);

        console.log(extensionElements.get("values"));

        const { input, output } = extensionElements.get("values").find((extension: any) => extension.$type === "yalc:ioMapping");

        setInput(input[0]);
        setOutput(output[0]);
    }, []);

    const setInputTarget = (value: string) => {
        const modeling = modeler.get("modeling");

        console.log(input);
        if (!input) return;

        input.target = value;

        modeling.updateProperties(element, {
            extensionElements,
        });
    };

    const setOutputTarget = (value: string) => {
        const modeling = modeler.get("modeling");

        console.log(output);
        if (!output) return;

        output.target = value;

        modeling.updateProperties(element, {
            extensionElements,
        });
    };

    return (
        <AccordionItem value="gs">
            <AccordionTrigger>Gateway Properties</AccordionTrigger>
            <AccordionContent className="flex flex-col p-5 gap-5">
                <div className="flex justify-between">
                    <Label>Input</Label>
                </div>
                <div className="flex gap-2.5 items-center p-5 bg-slate-100 rounded-md">
                    <Label className="w-32">Target</Label>
                    <Input
                        onBlur={(event) => {
                            setInputTarget(event.target.value);
                        }}
                        placeholder="Expression"
                        defaultValue=""
                    />
                </div>
                <Label>Output</Label>
                <div className="flex gap-2.5 items-center p-5 bg-slate-100 rounded-md">
                    <Label className="w-32">Output</Label>
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
