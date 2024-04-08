"use client";

import { AccordionItem, AccordionTrigger, AccordionContent, Label, Input } from "@repo/ui";
import { getBusinessObject } from "bpmn-js/lib/util/ModelUtil";
import { useEffect, useState } from "react";

export default function GatewayProps({ element, modeler }) {
    const [extensionElements, setExtensionElements] = useState<any>();
    // eslint-disable-next-line no-unused-vars
    const [condition, setCondition] = useState<any>();

    useEffect(() => {
        const bObject = getBusinessObject(element);
        if (!bObject.extensionElements) return;

        const extensionElements = bObject.extensionElements;
        setExtensionElements(extensionElements);

        console.log(extensionElements.get("values"));

        const expression = extensionElements.get("values").find((extension: any) => extension.$type === "yalc:ConditionExpression");
        setCondition(expression);
    }, []);

    const setExpression = (value: string) => {
        const modeling = modeler.get("modeling");

        if (!condition) return;
        condition.text = value;

        modeling.updateProperties(element, {
            extensionElements,
        });
    };

    return (
        <AccordionItem value="sequenceFlow">
            <AccordionTrigger>SequenceFlow Properties</AccordionTrigger>
            <AccordionContent className="flex flex-col p-5 gap-5">
                <Label>Conditions</Label>
                <div className="flex gap-2.5 items-center p-5 bg-slate-100 rounded-md">
                    <Label className="w-32">Target</Label>
                    <Input onBlur={(event) => setExpression(event.target.value)} placeholder="Expression" defaultValue={condition?.text ?? ""} />
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
