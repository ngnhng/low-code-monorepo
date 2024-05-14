/* eslint-disable unicorn/no-nested-ternary */
import { ComponentConfig } from "@measured/puck";

import { Label, Input, Switch, Button, DatePicker } from "@repo/ui";
// import { useMobxStore } from "lib/mobx/store-provider";
import { Fragment, useState } from "react";
import { TableSelector } from "../../table-selector";
import { useMobxStore } from "../../../../../../lib/mobx/store-provider";
import { toast } from "sonner";

export type FormTableProps = {
    tableId: string;
    formName: string;
    workflowId: string;
};

export const FormTable: ComponentConfig<FormTableProps> = {
    fields: {
        tableId: {
            type: "custom",
            label: "Select Table",
            render: ({ onChange, value }) => {
                return <TableSelector onChange={onChange} value={value} />;
            },
        },
        formName: {
            type: "text",
        },
        workflowId: {
            type: "custom",
            render: () => {
                return <></>;
            },
        },
    },
    defaultProps: {
        tableId: "",
        formName: "Form Name",
        workflowId: "",
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    render: ({ tableId, formName, workflowId }) => {
        const {
            tableData: { tables, insertRow },
        } = useMobxStore();

        const columns = tables.find((table) => table.id === tableId)?.columns;

        const [sendData, setSendData] = useState<any>({});

        // if no tableId
        if (!tableId) {
            return (
                <div className="flex w-full h-96 justify-center items-center h-20 bg-slate-100 rounded-md">
                    Select a table
                </div>
            );
        }

        const postData = async () => {
            console.log(sendData);
            await insertRow(tableId, sendData)
                .then(() => {
                    toast.success("Data inserted successfully");
                })
                .catch((error) => {
                    toast.error("Error inserting data");
                    console.error(error);
                });
            setSendData({});

            if (workflowId === "") return;
        };

        const renderFormField = ({ label, type, id, name }) => {
            const handleValueChange = (value) => {
                setSendData((prevData) => ({ ...prevData, [name]: value }));
            };

            switch (type) {
                case "boolean": {
                    return (
                        <div
                            className="flex w-full justify-between items-center pt-2.5 pb-2.5"
                            key={id}
                        >
                            <Label>{label}</Label>
                            <Switch onCheckedChange={handleValueChange} />
                        </div>
                    );
                }
                case "date": {
                    return (
                        <Fragment key={id}>
                            <Label>{label}</Label>
                            <DatePicker onChange={handleValueChange} />
                        </Fragment>
                    );
                }
                case "time": {
                    return (
                        <Fragment key={id}>
                            <Label>{label}</Label>
                            <input
                                type="time"
                                className="p-2.5 rounded-md"
                                onChange={(event) =>
                                    handleValueChange(event.target.value)
                                }
                            />
                        </Fragment>
                    );
                }
                default: {
                    return (
                        <Fragment key={id}>
                            <Label>{label}</Label>
                            <Input
                                value={sendData[name] || ""}
                                placeholder={label}
                                onChange={(event) =>
                                    handleValueChange(event.target.value)
                                }
                            />
                        </Fragment>
                    );
                }
            }
        };

        return (
            <div className="flex flex-col gap-2.5 ml-auto mr-auto p-24 w-full">
                <div className="font-bold">{formName}</div>
                <div className="bg-slate-100 p-5 rounded-md flex flex-col gap-2.5">
                    {columns
                        ? columns
                              .filter(
                                  (col) =>
                                      col.label !== "id" && col.type !== "link"
                              )
                              .map((col) => renderFormField(col))
                        : ""}
                    <Button onClick={postData} className="self-end">
                        Submit
                    </Button>
                </div>
            </div>
        );
    },
};
