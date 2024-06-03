/* eslint-disable unicorn/no-nested-ternary */
import { ComponentConfig, FieldLabel } from "@measured/puck";

import { Label, Input, Switch, Button, DatePicker, Checkbox, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Slider } from "@repo/ui";
// import { useMobxStore } from "lib/mobx/store-provider";
import { Fragment, useState } from "react";
import { TableSelector } from "../../table-selector";
import { useMobxStore } from "../../../../../../lib/mobx/store-provider";
import { toast } from "sonner";
import { WorkflowSelector } from "../../workflow-selector";
import useSWR from "swr";

type SliderProps = {
    id: string;
    min: number;
    max: number;
    step: number;
};

export type FormTableProps = {
    table: {
        tableId: string;
        enabledFields: Array<string>;
        sliderFields: Array<SliderProps>;
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
                console.log(value);
                const {
                    projectData: { currentProjectId },
                    tableData: { fetchTables },
                } = useMobxStore();

                const { data: list, isLoading, error } = useSWR(["tables", currentProjectId], () => fetchTables());

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
                                        .find((table) => table.id === value.tableId)
                                        ?.columns.map((column) => {
                                            return (
                                                column.name !== "id" && (
                                                    <div key={column.name} className="flex flex-col items-start p-2.5 gap-2.5 bg-slate-200">
                                                        <div className="flex items-center gap-2.5">
                                                            <Checkbox
                                                                id={column.id}
                                                                checked={value.enabledFields.includes(column.name)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                        ? onEnabledFieldsChange([...value.enabledFields, column.name])
                                                                        : onEnabledFieldsChange(
                                                                              value.enabledFields.filter((name) => name !== column.name)
                                                                          );
                                                                }}
                                                            />
                                                            <label htmlFor={column.id}>{column.label}</label>
                                                        </div>
                                                        {column.type === "number" ? (
                                                            <div className="w-full flex-1 flex flex-col gap-2.5">
                                                                <Label className="text-sm">Input type</Label>
                                                                <Select
                                                                    defaultValue={
                                                                        value.sliderFields?.find((field) => field.id === column.id)
                                                                            ? "slider"
                                                                            : "input"
                                                                    }
                                                                    onValueChange={(inputValue) => {
                                                                        if (inputValue === "input") {
                                                                            onChange({
                                                                                ...value,
                                                                                sliderFields: value.sliderFields?.filter(
                                                                                    (field) => field.id !== column.id
                                                                                ),
                                                                            });
                                                                            return;
                                                                        }

                                                                        onChange({
                                                                            ...value,
                                                                            sliderFields: [
                                                                                ...value.sliderFields,
                                                                                {
                                                                                    id: column.id,
                                                                                    min: 0,
                                                                                    max: 5,
                                                                                    step: 1,
                                                                                },
                                                                            ],
                                                                        });
                                                                    }}
                                                                >
                                                                    <SelectTrigger className="w-full">
                                                                        <SelectValue placeholder="Theme" />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="w-full">
                                                                        <SelectItem value="input">Input Field</SelectItem>
                                                                        <SelectItem value="slider">Slider</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                {value.sliderFields?.find((field) => field.id === column.id) ? (
                                                                    <>
                                                                        <div className="flex justify-between gap-2.5 items-center">
                                                                            <Label className="text-sm">Min</Label>
                                                                            <Input
                                                                                className="w-[100px]"
                                                                                type="number"
                                                                                defaultValue={
                                                                                    value.sliderFields?.find((field) => field.id === column.id)
                                                                                        ?.min ?? 0
                                                                                }
                                                                                onChange={(event) => {
                                                                                    const index = value.sliderFields?.findIndex(
                                                                                        (field) => field.id === column.id
                                                                                    );
                                                                                    value.sliderFields[index]!.min = Number.parseInt(
                                                                                        event.target.value
                                                                                    );
                                                                                    onChange({ ...value });
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <div className="flex justify-between gap-2.5 items-center">
                                                                            <Label className="text-sm">Max</Label>
                                                                            <Input
                                                                                className="w-[100px]"
                                                                                type="number"
                                                                                defaultValue={
                                                                                    value.sliderFields?.find((field) => field.id === column.id)
                                                                                        ?.max ?? 5
                                                                                }
                                                                                onChange={(event) => {
                                                                                    const index = value.sliderFields?.findIndex(
                                                                                        (field) => field.id === column.id
                                                                                    );
                                                                                    value.sliderFields[index]!.max = Number.parseInt(
                                                                                        event.target.value
                                                                                    );
                                                                                    onChange({ ...value });
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <div className="flex justify-between gap-2.5 items-center">
                                                                            <Label className="text-sm">Step</Label>
                                                                            <Input
                                                                                className="w-[100px]"
                                                                                type="number"
                                                                                defaultValue={
                                                                                    value.sliderFields?.find((field) => field.id === column.id)
                                                                                        ?.step ?? 1
                                                                                }
                                                                                onChange={(event) => {
                                                                                    const index = value.sliderFields?.findIndex(
                                                                                        (field) => field.id === column.id
                                                                                    );
                                                                                    value.sliderFields[index]!.step = Number.parseInt(
                                                                                        event.target.value
                                                                                    );
                                                                                    onChange({ ...value });
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    ""
                                                                )}
                                                            </div>
                                                        ) : (
                                                            ""
                                                        )}
                                                    </div>
                                                )
                                            );
                                        })}
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
            sliderFields: [],
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

        const { data: tables, isLoading } = useSWR(["tables", currentProjectId], () => fetchTablesByProjectId(currentProjectId), {
            revalidateOnFocus: false,
        });

        const columns = tables?.find((itable) => itable.id === table.tableId)?.columns;

        // if no tableId
        if (!table.tableId) {
            return <div className="flex w-full h-96 justify-center items-center h-20 bg-slate-100 rounded-md">Select a table</div>;
        }

        if (!tables || isLoading || !columns || !currentProjectId) {
            return <div className="flex w-full h-96 justify-center items-center h-20 bg-slate-100 rounded-md">Loading...</div>;
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
                console.log("Value changed", value);
                // if value is array, get the first element
                if (Array.isArray(value)) {
                    value = value[0];
                }
                // if value is number, convert to srting
                if (typeof value === "number") {
                    value = value.toString();
                }

                setSendData((prevData) => ({ ...prevData, [name]: value }));
            };

            switch (type) {
                case "boolean": {
                    return (
                        <div className="flex w-full justify-between items-center pt-2.5 pb-2.5" key={id}>
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
                            <input type="time" className="p-2.5 rounded-md" onChange={(event) => handleValueChange(event.target.value)} />
                        </Fragment>
                    );
                }
                default: {
                    if (table.sliderFields.some((field) => field.id === id)) {
                        const fieldProps = table.sliderFields.find((field) => field.id === id);
                        return (
                            <Fragment key={id}>
                                <Label>{label}</Label>
                                <div className="flex gap-2.5">
                                    <Slider
                                        defaultValue={[Math.round((fieldProps!.max + fieldProps!.min) / 2)]}
                                        max={fieldProps!.max}
                                        min={fieldProps!.min}
                                        step={fieldProps!.step}
                                        onValueChange={(value) => handleValueChange(value)}
                                    />
                                    <div className="w-[50px] text-right">{sendData[name] ?? Math.round((fieldProps!.max + fieldProps!.min) / 2)}</div>
                                </div>
                            </Fragment>
                        );
                    }

                    return (
                        <Fragment key={id}>
                            <Label>{label}</Label>
                            <Input value={sendData[name] || ""} placeholder={label} onChange={(event) => handleValueChange(event.target.value)} />
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
                              .filter((col) => col.label !== "id" && col.type !== "link" && table.enabledFields.includes(col.name))
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
