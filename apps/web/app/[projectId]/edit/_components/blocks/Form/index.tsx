import { ComponentConfig } from "@measured/puck";

import { Label, Input, Switch, Button, Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@repo/ui";
import { Fragment, useState } from "react";

type FormInput = {
    label: string;
    type: "number" | "string" | "boolean";
};

export type FormProps = {
    inputs: FormInput[];
    workflowId: string;
};

export const Form: ComponentConfig<FormProps> = {
    fields: {
        inputs: {
            type: "custom",
            render: ({ value, onChange }) => {
                return (
                    <div className="flex flex-col gap-2.5">
                        {value.map((input: FormInput, idx: number) => (
                            <div className="p-5 border-2 border-slate-400 border-dashed rounded-md flex flex-col gap-2.5" key={idx}>
                                <Label>Label</Label>
                                <Input
                                    defaultValue={input.label}
                                    onBlur={(event) => {
                                        input.label = event.target.value;
                                        onChange([...value]);
                                    }}
                                />
                                <Select
                                    defaultValue={input.type}
                                    onValueChange={(selectValue) => {
                                        input.type = selectValue as "string" | "number" | "boolean";
                                        onChange([...value]);
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="string">String</SelectItem>
                                            <SelectItem value="number">Number</SelectItem>
                                            <SelectItem value="boolean">Boolean</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <Button
                                    onClick={() => {
                                        onChange([...value.slice(0, idx), ...value.slice(idx + 1)]);
                                    }}
                                    variant="destructive"
                                >
                                    Remove Field
                                </Button>
                            </div>
                        ))}
                        <Button
                            onClick={() => {
                                let counter = 0;

                                while (value.some((input: FormInput) => input.label === `Label${counter === 0 ? "" : counter}`)) {
                                    counter++;
                                }

                                onChange([
                                    ...value,
                                    {
                                        label: `Label${counter === 0 ? "" : counter}`,
                                        type: "string",
                                    },
                                ]);
                            }}
                        >
                            Add new field
                        </Button>
                    </div>
                );
            },
        },
        workflowId: {
            type: "text",
        },
    },
    defaultProps: {
        inputs: [
            {
                label: "Test Label 1234 56778",
                type: "string",
            },
        ],
        workflowId: "",
    },
    render: ({ inputs, workflowId }) => {
        const [data, setData] = useState<any>({});

        return (
            <div className="bg-slate-100 p-5 w-96 rounded-md ml-auto mr-auto flex flex-col gap-2.5">
                {inputs ? (
                    <>
                        {inputs.map(({ label, type }) => {
                            const id = `_${workflowId}_testFormID_${label.toLowerCase().replaceAll(/\s+/g, "-")}`;

                            if (data[id] === undefined) {
                                const copyData = structuredClone(data);
                                copyData[id] = "";
                                setData(copyData);
                            }

                            return (
                                <Fragment key={id}>
                                    {type === "boolean" ? (
                                        <div className="flex w-full justify-between items-center">
                                            <Label>{label}</Label>
                                            <Switch
                                                onChange={(event) => {
                                                    console.log(event);
                                                    // data[id] = event.target.value;
                                                    // setData({
                                                    //     ...data,
                                                    // });
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <Label>{label}</Label>
                                            <Input
                                                onChange={(event) => {
                                                    data[id] = event.target.value;
                                                    setData({
                                                        ...data,
                                                    });
                                                }}
                                            />
                                        </>
                                    )}
                                </Fragment>
                            );
                        })}
                        <Button
                            onClick={() => {
                                console.log(workflowId);
                                console.log(data);
                            }}
                            className="self-end"
                        >
                            Submit
                        </Button>
                    </>
                ) : (
                    "Please add fields to the form"
                )}
            </div>
        );
    },
};
