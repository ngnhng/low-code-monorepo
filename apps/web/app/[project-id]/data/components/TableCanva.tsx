"use client";
import { TableRenderer } from "./TableRenderer";
import { TableCanvaProps, CanvaToolbar } from "./TableEditor";


export function TableCanva({
	state, dispatch, setRowConfig, setColumnConfig,
}: TableCanvaProps) {
	return (
		<div className="canva">
			<CanvaToolbar />
			<TableRenderer data={state.data} dispatch={dispatch} />
		</div>
	);
}
