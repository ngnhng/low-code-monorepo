import { AccordionItem, AccordionContent, AccordionTrigger, Label, Input } from "@repo/ui";

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
    }, [])
    
    const setInputData = (value: string, input: any, type: "source" | "target") => {
        const modeling = modeler.get("modeling");

        if (!input) return;
        input[type] = value;

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
                            <div className="flex flex-col gap-2.5" key={`${input.source}-${idx}`}>
                                <div className="flex gap-2.5 w-full items-center">
                                    <Label>Target</Label>
                                    <div className="p-2.5 bg-slate-200 rounded-md flex-1">{input.target}</div>
                                </div>
                                <Label>Source</Label>
                                <Input
                                    onBlur={(event) => setInputData(event.target.value, input, "source")}
                                    placeholder="Identifer"
                                    defaultValue={input.source}
                                    className="flex-1"
                                />
                            </div>
                        );
                    })}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
