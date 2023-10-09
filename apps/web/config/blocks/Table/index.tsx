import React from "react";
import { ComponentConfig } from "@measured/puck/types/Config";
import styles from "./styles.module.css";
import { getClassNameFactory } from "@measured/puck/lib";
import { TableRenderer } from "./TableRender";

const getClassName = getClassNameFactory("Table", styles);

export type Column = {
    key: string;
    label: string;
    type: "text" | "textarea" | "select" | "radio" | "array" | "external";
    dataType?: "string" | "number" | "boolean";
    options?: { label: string; value: string | number | boolean }[];
};

export type TableProps = {
    title: string;
    columns: Column[];
    _data?: object;
};

const initialData: TableProps = {
    columns: [
        { key: "id", label: "ID", type: "text" },
        { key: "name", label: "Name", type: "text" },
        { key: "email", label: "Email", type: "text" },
    ],
    title: "Table",
};

const localAdaptor = {
	name: "Local",
	fetchList: async (): Promise<Record<string, any>[]> => {
		return [
			{
				id: 1,
				name: "John Doe",
				email: "abc"
			},
		]
	}
}

export const Table: ComponentConfig<TableProps> = {
    fields: {
        _data: {
            type: "external",
			adaptor: localAdaptor,
        },
        title: { type: "text" },
        columns: {
            type: "array",
            arrayFields: {
                key: { type: "text" },
                label: { type: "text" },
                type: {
                    type: "select",
                    options: [
                        { label: "text", value: "text" },
                        { label: "textarea", value: "textarea" },
                        { label: "select", value: "select" },
                        { label: "radio", value: "radio" },
                        { label: "array", value: "array" },
                        { label: "external", value: "external" },
                    ],
                },
            },
        },
    },
    defaultProps: {
        title: "Table",
        columns: initialData.columns.map((column) => ({
            ...column,
        })),
    },
    render: ({ title, columns, _data }: TableProps) => {
        return (
            <TableRenderer
                columns={columns}
                data={_data}
                classNameFn={getClassName}
            />
        );
    },
};
