/* eslint-disable unicorn/no-nested-ternary */
/* eslint-disable unicorn/numeric-separators-style */
import { ComponentConfig } from "@measured/puck";

import { Label, Input, Switch, Button, DatePicker } from "@repo/ui";
import { useMobxStore } from "lib/mobx/store-provider";
import { Fragment, useState, useEffect } from "react";

type FormInput = {
    label: string;
    type: "number" | "string" | "boolean" | "date" | "time";
    id: {
        value: string;
    };
};

export type FormProps = {
    inputs: FormInput[];
    workflowId: string;
    formName: string;
};

export const Form: ComponentConfig<FormProps> = {
    fields: {
        inputs: {
            type: "array",
            arrayFields: {
                label: {
                    type: "text",
                },
                type: {
                    type: "select",
                    options: [
                        { label: "Number", value: "number" },
                        { label: "String", value: "string" },
                        { label: "Boolean", value: "boolean" },
                        { label: "Date", value: "date" },
                        { label: "Time", value: "time" },
                    ],
                },
                id: {
                    type: "custom",
                    render: ({ value, onChange }) => {
                        useEffect(() => {
                            if (value === undefined)
                                onChange({
                                    value: `${Math.floor(Math.random() * 65536).toString(16)}`,
                                });
                        }, []);
                        return <></>;
                    },
                },
            },
        },
        workflowId: {
            type: "custom",
            render: () => <></>,
        },
        formName: {
            type: "text",
        },
    },
    defaultProps: {
        inputs: [],
        workflowId: "",
        formName: "Form Name",
    },
    render: ({ inputs, workflowId, id: formID, formName }) => {
        const [data, setData] = useState<any>({});
        const {
            user: { currentUser },
        } = useMobxStore();

        const postData = async () => {
            console.log(workflowId, currentUser?.email, data);
        };

        return (
            <div className="flex flex-col gap-2.5 w-96 ml-auto mr-auto p-2.5">
                <div className="font-bold">{formName}</div>
                <div className="bg-slate-100 p-5 rounded-md flex flex-col gap-2.5">
                    {inputs ? (
                        <>
                            {inputs.map(({ label, type, id }) => {
                                const sendId = `_${workflowId}_${formID}_${id?.value}`;

                                if (data[sendId] === undefined) {
                                    const copyData = structuredClone(data);
                                    // switch (type) {
                                    //     case "number": {
                                    //         copyData[sendId] = 1;
                                    //         break;
                                    //     }
                                    //     case "string": {
                                    //         copyData[sendId] = "";
                                    //         break;
                                    //     }
                                    //     case "boolean": {
                                    //         copyData[sendId] = false;
                                    //         break;
                                    //     }
                                    // }
                                    copyData[sendId] = "";

                                    setData(copyData);
                                }

                                return (
                                    <Fragment key={sendId}>
                                        {type === "boolean" ? (
                                            <div className="flex w-full justify-between items-center pt-2.5 pb-2.5">
                                                <Label>{label}</Label>
                                                <Switch
                                                    onCheckedChange={(value) => {
                                                        data[sendId] = value;
                                                        setData({
                                                            ...data,
                                                        });
                                                    }}
                                                />
                                            </div>
                                        ) : type === "date" ? (
                                            <>
                                                <Label>{label}</Label>
                                                <DatePicker
                                                    onChange={(value: Date) => {
                                                        data[sendId] = value.toLocaleDateString("en-CA");
                                                        setData({
                                                            ...data,
                                                        });
                                                    }}
                                                />
                                            </>
                                        ) : type === "time" ? (
                                            <>
                                                <Label>{label}</Label>
                                                <input type="time" className="p-2.5 rounded-md" onChange={(event) => {
                                                    const { value } = event.target;
                                                    data[sendId] = value;

                                                    setData({
                                                        ...data
                                                    })
                                                }}/>
                                            </>
                                        ) : (
                                            <>
                                                <Label>{label}</Label>
                                                <Input
                                                    onChange={(event) => {
                                                        data[sendId] = event.target.value;
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
                                    postData();
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
            </div>
        );
    },
};
