/* eslint-disable unicorn/no-nested-ternary */
import { ComponentConfig, FieldLabel } from "@measured/puck";

import { Label, Input, Switch, Button, DatePicker, Checkbox } from "@repo/ui";
// import { useMobxStore } from "lib/mobx/store-provider";
import { Fragment, useState } from "react";
import { TableSelector } from "../../table-selector";
import { useMobxStore } from "../../../../../../lib/mobx/store-provider";
import { toast } from "sonner";
import { WorkflowSelector } from "../../workflow-selector";
import useSWR from "swr";

export type FormTableProps = {
    table: {
        tableId: string;
        enabledFields: Array<string>;
    };
    formName: string;
    workflowId: string;
    project: {
        projectId: string;
        accessKey: string;
    };
};

export const FormTable: ComponentConfig<FormTableProps> = {
    fields: {
        table: {
            type: "custom",
            label: "Select Table",
            render: ({ onChange, value, field }) => {
                const {
                    projectData: { currentProjectId },
                    tableData: { fetchTables },
                } = useMobxStore();

                const {
                    data: list,
                    isLoading,
                    error,
                } = useSWR(["tables", currentProjectId], () => fetchTables());

                const onEnabledFieldsChange = (enabledFields) => {
                    onChange({ ...value, enabledFields });
                };

                return (
                    <FieldLabel label={field.label ?? ""}>
                        <div className="flex flex-col gap-2.5">
                            <TableSelector onChange={onChange} value={value} />
                            {list && !isLoading && !error && value?.tableId && (
                                <>
                                    {list
                                        .find(
                                            (table) =>
                                                table.id === value.tableId
                                        )
                                        ?.columns.map(
                                            (column) =>
                                                column.name !== "id" && (
                                                    <div
                                                        key={column.name}
                                                        className="flex items-center gap-2.5"
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <Checkbox
                                                                id={column.id}
                                                                checked={value.enabledFields.includes(
                                                                    column.name
                                                                )}
                                                                onCheckedChange={(
                                                                    checked
                                                                ) => {
                                                                    return checked
                                                                        ? onEnabledFieldsChange(
                                                                              [
                                                                                  ...value.enabledFields,
                                                                                  column.name,
                                                                              ]
                                                                          )
                                                                        : onEnabledFieldsChange(
                                                                              value.enabledFields.filter(
                                                                                  (
                                                                                      name
                                                                                  ) =>
                                                                                      name !==
                                                                                      column.name
                                                                              )
                                                                          );
                                                                }}
                                                            />
                                                            <label
                                                                htmlFor={
                                                                    column.id
                                                                }
                                                            >
                                                                {column.label}
                                                            </label>
                                                        </div>
                                                    </div>
                                                )
                                        )}
                                </>
                            )}
                        </div>
                    </FieldLabel>
                );
            },
        },
        formName: {
            type: "text",
            label: "Form Name",
        },
        workflowId: {
            type: "custom",
            label: "Select Workflow",
            render: ({ onChange, value, field }) => {
                return (
                    <FieldLabel label={field.label ?? ""}>
                        <WorkflowSelector onChange={onChange} value={value} />
                    </FieldLabel>
                );
            },
        },
        project: {
            type: "custom",
            label: "Project ID",
            render: ({ onChange, value }) => {
                const {
                    projectData: { currentProjectId },
                } = useMobxStore();

                if (currentProjectId !== value?.projectId) {
                    onChange({
                        projectId: currentProjectId,
                        accessKey: "",
                    });
                }

                return (
                    <FieldLabel label="Project ID">
                        <Input value={currentProjectId} disabled />
                    </FieldLabel>
                );
            },
        },
    },
    defaultProps: {
        table: {
            tableId: "",
            enabledFields: [],
        },
        formName: "Form Name",
        workflowId: "",
        project: {
            projectId: "",
            accessKey: "",
        },
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    render: ({ table, formName, workflowId, project }) => {
        const {
            tableData: { insertRow, fetchTablesByProjectId },
            workflow: { launchWorkflowWithPayload },
        } = useMobxStore();

        const currentProjectId = project.projectId;

        const [sendData, setSendData] = useState<any>({});

        const { data: tables, isLoading } = useSWR(
            ["tables", currentProjectId],
            () => fetchTablesByProjectId(currentProjectId),
            {
                revalidateOnFocus: false,
            }
        );

        const columns = tables?.find(
            (itable) => itable.id === table.tableId
        )?.columns;

        // if no tableId
        if (!table.tableId) {
            return (
                <div className="flex w-full h-96 justify-center items-center h-20 bg-slate-100 rounded-md">
                    Select a table
                </div>
            );
        }

        if (!tables || isLoading || !columns || !currentProjectId) {
            return (
                <div className="flex w-full h-96 justify-center items-center h-20 bg-slate-100 rounded-md">
                    Loading...
                </div>
            );
        }

        const postData = async () => {
            console.log("Form payload", sendData);
            if (table.tableId && table.tableId !== "")
                try {
                    await insertRow({
                        tableId: table.tableId,
                        data: sendData,
                        projectId: currentProjectId,
                    });
                    toast.success("Data inserted successfully");
                } catch (error) {
                    toast.error("Error inserting data");
                    console.error(error);
                    return; // If inserting data fails, we exit the function early
                }

            if (workflowId === "") {
                setSendData({});
                return;
            }

            try {
                await launchWorkflowWithPayload(workflowId, sendData);
                toast.success("Workflow triggered successfully");
            } catch (error) {
                toast.error("Error launching workflow");
                console.error(error);
            }

            setSendData({});
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
                                      col.label !== "id" &&
                                      col.type !== "link" &&
                                      table.enabledFields.includes(col.name)
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
