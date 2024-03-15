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

    useEffect(() => {
        const bObject = getBusinessObject(element);
        if (!bObject.extensionElements) return;

        const extensionElements = bObject.extensionElements;
        setExtensionElements(extensionElements);

        // console.log(extensionElements.get('values'));
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

    const setInputTarget = (value: string) => {
        const modeling = modeler.get("modeling");
        const { ioMapping } = extensionElements.get("values").find((extension: any) => extension.ioMapping);

        console.log(ioMapping);
        if (!ioMapping) return;

        const input = ioMapping.find((input: any) => input.source !== "=_globalContext_user");

        console.log(input);
        if (!input) return;

        input.target = value;

        modeling.updateProperties(element, {
            extensionElements,
        });
    };

    const setFunctionType = (value: string) => {
        const fnEnum = {
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
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select an action" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="add">Add Row</SelectItem>
                            <SelectItem value="remove">Remove Row</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <div className="flex justify-between">
                    <Label>Inputs</Label>
                    <button onClick={() => addInput()}>
                        <Plus />
                    </button>
                </div>
                <div className="w-full flex flex-col gap-5">
                    <div className="flex gap-2.5">
                        <Input
                            onBlur={(event) => {
                                setInputSource(event.target.value);
                            }}
                            placeholder="Source"
                        />
                        <Input
                            onBlur={(event) => {
                                setInputTarget(event.target.value);
                            }}
                            placeholder="Target"
                        />
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
