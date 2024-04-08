"use client";

import { AccordionItem, AccordionTrigger, AccordionContent, Label, Input } from "@repo/ui";
import { getBusinessObject } from "bpmn-js/lib/util/ModelUtil";
import { useEffect, useState } from "react";
import { Plus } from "react-feather";
import { Trash } from "react-feather";

export default function UserTaskProps({ element, modeler }) {
    const [extensionElements, setExtensionElements] = useState<any>();
    // eslint-disable-next-line no-unused-vars
    const [inputs, setInputs] = useState<any>([]);
    const [output, setOutput] = useState<any>();

    useEffect(() => {
        const bObject = getBusinessObject(element);
        if (!bObject.extensionElements) return;

        const extensionElements = bObject.extensionElements;
        setExtensionElements(extensionElements);

        const { input, output } = extensionElements.get("values").find((extension: any) => extension.$type === "yalc:IoMapping");

        setInputs(input ?? []);
        setOutput(output[0]);
    }, []);

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

    const addInput = () => {
        const moddle = modeler.get("moddle");
        const modeling = modeler.get("modeling");

        const ioMapping = extensionElements.get("values").find((extension: any) => extension.$type === "yalc:IoMapping");

        const input = moddle.create("yalc:Input", {
            source: "",
            target: "",
        });
        ioMapping.get("input").push(input);

        modeling.updateProperties(element, {
            extensionElements,
        });

        console.log(ioMapping.input);
        setInputs([...(ioMapping.input ?? [])]);
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
                <div className="flex justify-between">
                    <Label>Inputs</Label>
                    <button onClick={() => addInput()}>
                        <Plus />
                    </button>
                </div>
                <div className="w-full flex flex-col gap-5 p-5 bg-slate-100 rounded-md">
                    {inputs.map((input: any, idx: number) => {
                        console.log(idx);
                        return (
                            <div className="flex gap-2.5 items-center" key={`${input.source}-${idx}`}>
                                <Label className="w-32">Source</Label>
                                <Input
                                    onBlur={(event) => setInputData(event.target.value, input, "source")}
                                    placeholder="Expression"
                                    defaultValue={input.source}
                                />
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
