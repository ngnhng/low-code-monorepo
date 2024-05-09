/* eslint-disable unicorn/no-nested-ternary */
import { ComponentConfig } from "@measured/puck";

import { Label, Input, Switch, Button, DatePicker } from "@repo/ui";
// import { useMobxStore } from "lib/mobx/store-provider";
import { Fragment, useState, useEffect } from "react";
import useSWR from "swr";

export type FormTableProps = {
    tableId: string;
    formName: string;
    workflowId: string;
};

export const FormTable: ComponentConfig<FormTableProps> = {
    fields: {
        tableId: {
            type: "text",
        },
        formName: {
            type: "text"
        },
        workflowId: {
            type: "custom",
            render: () => { return <></> }
        }
    },
    defaultProps: {
        tableId: "",
        formName: "Form Name",
        workflowId: ""
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    render: ({ tableId, formName, workflowId }) => {
        const [sendData, setSendData] = useState<any>({});

        const { data, isLoading } = useSWR("/api/table", async (url) =>
            fetch(url)
                .then((res) => res.json())
                .then((json) => json)
        );

        useEffect(() => {
            if (!data || isLoading) return;

            for (const col of data) {
                sendData[col.id] = "";
            }

            setSendData({ ...sendData });
        }, [data]);

        const postData = () => {
            console.log(sendData);

            if (workflowId === "") return;
        }

        return (
            <div className="flex flex-col gap-2.5 w-96 ml-auto mr-auto p-2.5">
                <div className="font-bold">{formName}</div>
                <div className="bg-slate-100 p-5 rounded-md flex flex-col gap-2.5">
                    {isLoading ? (
                        ""
                    ) : (
                        <>
                            {data.map(({ label, type, id }) =>
                                type === "boolean" ? (
                                    <div className="flex w-full justify-between items-center pt-2.5 pb-2.5" key={id}>
                                        <Label>{label}</Label>
                                        <Switch
                                            onCheckedChange={(value) => {
                                                sendData[id] = value;
                                                setSendData({ ...sendData });
                                            }}
                                        />
                                    </div>
                                ) : type === "date" ? (
                                    <Fragment key={id}>
                                        <Label>{label}</Label>
                                        <DatePicker
                                            onChange={(value: Date) => {
                                                sendData[id] = value;
                                                setSendData({ ...sendData });
                                            }}
                                        />
                                    </Fragment>
                                ) : type === "time" ? (
                                    <Fragment key={id}>
                                        <Label>{label}</Label>
                                        <input
                                            type="time"
                                            className="p-2.5 rounded-md"
                                            onChange={(event) => {
                                                sendData[id] = event.target.value;
                                                setSendData({ ...sendData });
                                            }}
                                        />
                                    </Fragment>
                                ) : (
                                    <Fragment key={id}>
                                        <Label>{label}</Label>
                                        <Input
                                            onChange={(event) => {
                                                sendData[id] = event.target.value;
                                                setSendData({ ...sendData });
                                            }}
                                        />
                                    </Fragment>
                                )
                            )}
                        </>
                    )}
                    <Button
                        onClick={() => {
                            postData();
                        }}
                        className="self-end"
                    >
                        Submit
                    </Button>
                </div>
            </div>
        );
    },
};
