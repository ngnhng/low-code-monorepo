import { AccordionItem, AccordionContent, AccordionTrigger, Label, Input, Button } from "@repo/ui";
import { Trash2 } from "lucide-react";

import { getBusinessObject } from "bpmn-js/lib/util/ModelUtil";
import { useEffect, useState } from "react";

export default function MailServiceProps({ element, modeler }) {
    const [extensionElements, setExtensionElements] = useState<any>();
    const [inputs, setInputs] = useState<any>([]);

    useEffect(() => {
        const bObject = getBusinessObject(element);
        if (!bObject.extensionElements) return;

        const extensionElements = bObject.extensionElements;
        setExtensionElements(extensionElements);

        const { input } = extensionElements.get("values").find((extension: any) => extension.$type === "yalc:IoMapping");

        setInputs(input ?? []);
    }, []);

    const setInputData = (value: string, input: any, type: "source" | "target") => {
        const modeling = modeler.get("modeling");

        if (!input) return;
        input[type] = value;

        modeling.updateProperties(element, {
            extensionElements,
        });
    };

    const addInput = () => {
        const modeling = modeler.get("modeling");
        const moddle = modeler.get("moddle");

        const ioMapping = extensionElements.get("values").find((extension: any) => extension.$type === "yalc:IoMapping");
        const newInput = moddle.create("yalc:Input", {
            source: "",
            target: "",
        });

        ioMapping.get("input").push(newInput);
        setInputs([...ioMapping.input]);

        modeling.updateProperties(element, {
            extensionElements,
        });
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
            <AccordionTrigger>Mail Service Properties</AccordionTrigger>
            <AccordionContent className="flex flex-col p-5 gap-5">
                <Label>Inputs</Label>
                <div className="w-full flex flex-col gap-5 p-5 bg-slate-100 rounded-md">
                    {inputs.map((input: any, idx: number) => {
                        console.log(idx);
                        return (
                            <div className="flex gap-5 items-center">
                                <div className="flex-1 flex flex-col gap-2.5 p-2.5 rounded-md bg-slate-200" key={`${input.source}-${idx}`}>
                                    <div className="flex gap-2.5 w-full items-center">
                                        <Label className="w-[50px]">Target</Label>
                                        {idx > 4 ? (
                                            <Input
                                                onBlur={(event) => setInputData(event.target.value, input, "target")}
                                                placeholder="Identifer"
                                                defaultValue={input.target}
                                                className="flex-1"
                                            />
                                        ) : (
                                            <div className="p-2.5 bg-slate-200 rounded-md flex-1">{input.target}</div>
                                        )}
                                    </div>
                                    <div className="flex gap-2.5 w-full items-center">
                                        <Label className="w-[50px]">Source</Label>
                                        <Input
                                            onBlur={(event) => setInputData(event.target.value, input, "source")}
                                            placeholder="Identifer"
                                            defaultValue={input.source}
                                            className="flex-1"
                                        />
                                    </div>
                                </div>
                                {idx > 4 ? (
                                    <button onClick={() => removeInput(idx)}>
                                        <Trash2 color="#f54263" />
                                    </button>
                                ) : (
                                    ""
                                )}
                            </div>
                        );
                    })}
                    <Button onClick={() => addInput()}>Add Input</Button>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
