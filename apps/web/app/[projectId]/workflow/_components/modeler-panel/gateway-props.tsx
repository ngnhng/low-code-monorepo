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
    // eslint-disable-next-line no-unused-vars
    const [expression, setExpression] = useState<any>();

    useEffect(() => {
        // check if element already has expression condition set
        const bObject = getBusinessObject(element);
        console.log(bObject);
        if (!bObject.conditionExpression) return;

        // set the expression
        setExpression(bObject.conditionExpression.body);
    }, []);

    const handleInputExpression = (value: string) => {
        const modeling = modeler.get("modeling");
        if (!value || value === "") {
			setExpression(undefined);
            modeling.updateProperties(element, {
                conditionExpression: undefined,
            });
            return;
        }
        const moddle = modeler.get("moddle");
        const expr = moddle.create("bpmn:FormalExpression", { body: value });
		setExpression(value);
        modeling.updateProperties(element, {
            conditionExpression: expr,
        });
    };

    return (
        <AccordionItem value="sequenceFlow">
            <AccordionTrigger>Sequence Flow Properties</AccordionTrigger>
            <AccordionContent className="flex flex-col p-5 gap-5">
                <Label>Conditions</Label>
                <div className="flex gap-2.5 items-center p-5 bg-slate-100 rounded-md">
                    <Label className="w-32">Condition</Label>
                    <Input
                        onBlur={(event) =>
                            handleInputExpression(event.target.value)
                        }
                        placeholder="Expression"
                        defaultValue={expression ?? ""}
                    />
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
