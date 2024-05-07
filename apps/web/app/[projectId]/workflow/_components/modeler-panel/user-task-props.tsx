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
import axios from "axios";

import { getBusinessObject } from "bpmn-js/lib/util/ModelUtil";
import { useEffect, useState } from "react";
import useSWR from "swr";

export default function UserTaskProps({ element, modeler }) {
    const [extensionElements, setExtensionElements] = useState<any>();
    // eslint-disable-next-line no-unused-vars
    const [inputs, setInputs] = useState<any>([]);
    const [output, setOutput] = useState<any>();
    const [route, setRoute] = useState<string>();

    useEffect(() => {
        const bObject = getBusinessObject(element);
        if (!bObject.extensionElements) return;

        const extensionElements = bObject.extensionElements;
        setExtensionElements(extensionElements);

        const { input, output } = extensionElements.get("values").find((extension: any) => extension.$type === "yalc:IoMapping");

        setInputs(input ?? []);
        setOutput(output[0]);
    }, []);

    const { data: formsList, isLoading } = useSWR("/api/ui/forms", async (url) => {
        const res = await axios.get(url);
        return res.data;
    });

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

    const setForm = (value: string) => {
        if (!route) return;

        const modeling = modeler.get("modeling");

        const ioMapping = extensionElements.get("values").find((extension: any) => extension.$type === "yalc:IoMapping");
        ioMapping.get("input").length = 0;

        const moddle = modeler.get("moddle");
        const formData = formsList[route][value];
        ioMapping.get("input").push(
            ...formData.props.inputs.map((data) =>
                moddle.create("yalc:Input", {
                    source: `_testWorkflowID_${formData.props.id}_${data.id.value}`,
                    target: "",
                })
            )
        );

        modeling.updateProperties(element, {
            extensionElements,
        });

        setInputs([...ioMapping.input] ?? []);
        return;
    };
    
    return (
        <AccordionItem value="userTask">
            <AccordionTrigger>User Task Properties</AccordionTrigger>
            <AccordionContent className="flex flex-col p-5 gap-5">
                {isLoading ? (
                    ""
                ) : (
                    <>
                        <Label>Select Form to get data from</Label>
                        <div className="flex gap-5">
                            <Select
                                onValueChange={(value) => {
                                    setRoute(value);
                                }}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select a route" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {Object.keys(formsList).map((route) => (
                                            <SelectItem value={route}>{route}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <Select
                                onValueChange={(value) => {
                                    setForm(value);
                                }}
                                disabled={route ? false : true}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select a form" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {formsList[route ?? ""]?.map((_: any, idx: number) => (
                                            <SelectItem value={`${idx}`}>{formsList[route ?? ""]?.[idx].props.id ?? ""}</SelectItem>
                                        )) ?? ""}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <Label>Inputs</Label>
                        <div className="w-full flex flex-col gap-5 p-5 bg-slate-100 rounded-md">
                            {inputs.map((input: any, idx: number) => {
                                console.log(idx);
                                return (
                                    <div className="flex gap-2.5 items-center" key={`${input.source}-${idx}`}>
                                        <div className="flex gap-2.5 w-[50%] items-center">
                                            <Label>Source</Label>
                                            <div className="p-2.5 bg-slate-200 rounded-md flex-1">{input.source}</div>
                                        </div>
                                        <Label>Target</Label>
                                        <Input
                                            onBlur={(event) => setInputData(event.target.value, input, "target")}
                                            placeholder="Identifer"
                                            defaultValue={input.target}
                                            className="flex-1"
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
                    </>
                )}
            </AccordionContent>
        </AccordionItem>
    );
}
