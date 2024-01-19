"use client";
import { TableCanvaProps } from "../types";
import { CanvaToolbar } from "./CanvaToolbar";
import { DatabaseQueryBuilder } from "./DatabaseQueryBuilder";
import { TableRenderer } from "./table-renderer";

export function TableCanva({
	state,
	dispatch,
	dispatchForceTrigger,
}: Readonly<TableCanvaProps>) {
	return (
		<div className="canva">
			<div
				className="canva__wrapper"
				style={{
					display: "flex",
					flexDirection: "column",
					height: "100vh",
					width: "100%",
					overflow: "auto",
				}}
			>
				<CanvaToolbar state={state} dispatch={dispatch} />
				<DatabaseQueryBuilder
					projectId={state.projectId}
					tableId={state.tableId}
					isOpen={state.isQueryBuilderOpen}
					dispatch={dispatch}
					dispatchWithTrigger={dispatchForceTrigger}
				/>
				<TableRenderer data={state.data} dispatch={dispatch} />
			</div>
		</div>
	);
}
