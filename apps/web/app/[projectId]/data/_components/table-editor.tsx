"use client";

import "./style.css";

import {
	TableEditorProps,
} from "../types";



export function TableEditor({
	projectId,
	tableId,
}: Readonly<TableEditorProps>) {
	return (
		<div>
			{projectId} {tableId}
		</div>
	)
	
}
