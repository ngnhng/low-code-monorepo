"use client";

import { ColumnHelper } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import {
	HTMLProps,
	Reducer,
	useEffect,
	useReducer,
	useRef,
	useState,
} from "react"
import { ColumnConfigMenu } from "./ColumnConfigMenu";
import { RowConfigMenu } from "./RowConfigMenu";
import "./style.css";
import { TableCanva } from "./table-canva";
import { TableEditorSidebar } from "./TableEditorSidebar";

import { Key } from "react-feather";
import {
	CanvaAction,
	CanvaState,
	ColumnProps,
	SELECTOR_COLUMN,
	TableEditorProps,
} from "../types";
import { checkDuplicateColumnLabel, fetchTableData } from "../utils";

const canvaReducer: Reducer<CanvaState, CanvaAction> = (state, action) => {
	switch (action.type) {
		case "open-config-add-column":
			return { ...state, isColumnConfigOpen: true };
		case "open-config-insert-row":
			return { ...state, isRowConfigOpen: true };
		case "close-config":
			return {
				...state,
				isColumnConfigOpen: false,
				isRowConfigOpen: false,
			};
		case "edit-config":
			return { ...state };
		case "add-row":
			return { ...state };
		case "remove-column":
			return { ...state };
		case "remove-row":
			return { ...state };
		case "select-table": // change table
			return {
				...state,
				tableId: action.tableId,
				isColumnConfigOpen: false,
				isRowConfigOpen: false,
			};
		case "set-data":
			return { ...state, data: action.payload };

		case "add-column":
			console.log("add-column", action.isSaved);
			return {
				...state,
				isModified: action.isSaved,
			};
		case "open-database-query-builder":
			return {
				...state,
				isQueryBuilderOpen: true,
				isColumnConfigOpen: false,
				isRowConfigOpen: false,
			};
		case "close-database-query-builder":
			return {
				...state,
				isQueryBuilderOpen: false,
				isColumnConfigOpen: false,
				isRowConfigOpen: false,
			};
		default:
			throw new Error();
	}
};

const useTableEditor = (projectId, tableId) => {
	const [canvaState, canvaDispatch] = useReducer(canvaReducer, {
		tableId: tableId,
		projectId: projectId,
	});

	const [updateTrigger, setUpdateTrigger] = useState(false);

	const dispatchWithTrigger = (action) => {
		canvaDispatch(action);
		setUpdateTrigger((prev) => !prev); // Toggle the trigger state
	};

	useEffect(() => {
		fetchTableData(projectId, tableId, canvaDispatch);
	}, [projectId, tableId, canvaDispatch, updateTrigger]);
	// we return two dispatches, one with trigger and one without
	// the one with trigger is used when we want to force trigger a re-fetch of table data
	return [canvaState, canvaDispatch, dispatchWithTrigger] as const;
};

const columnRoleIconMapping = (role: string) => {
	switch (role) {
		case "primary":
			return <Key size={12} />;
		default:
			return null;
	}
};

export const parseColumns = (
	columnsHelper: ColumnHelper<unknown>,
	columns: ColumnProps[],
	onAddColumn?: any
) => {
	const cols = columns.map((column) => {
		return columnsHelper.accessor(column.key, {
			id: column.key,
			header: ({ table }) => (
				<HeaderDiv>
					<TextDiv centerAlign={column.role != undefined}>
						{column.role && columnRoleIconMapping(column.role)}
						{column.label}
						<span style={{ fontSize: "12px", paddingLeft: "9px" }}>
							{column.type}
						</span>
					</TextDiv>
				</HeaderDiv>
			),
			cell: ({ row, getValue }) => (
				<HeaderDiv>
					<TextDiv centerAlign={column.key == "id"}>
						{getValue()}
					</TextDiv>
				</HeaderDiv>
			),
		});
	});

	const addCol = columnsHelper.accessor("add-column", {
		id: "add-column",
		header: () => (
			<button
				onClick={() => {
					onAddColumn({ type: "open-config-add-column" });
				}}
			>
				Add Column
			</button>
		),
		cell: () => <div style={{ border: "1px dotted black" }}></div>,
	});

	const selectorCol = columnsHelper.accessor(SELECTOR_COLUMN, {
		id: SELECTOR_COLUMN,
		header: ({ table }) => (
			<CheckboxDiv>
				<IndeterminateCheckbox
					{...{
						checked: table.getIsAllRowsSelected(),
						indeterminate: table.getIsSomeRowsSelected(),
						onChange: table.getToggleAllRowsSelectedHandler(),
					}}
				/>
			</CheckboxDiv>
		),
		cell: ({ row }) => (
			<CheckboxDiv>
				<IndeterminateCheckbox
					{...{
						checked: row.getIsSelected(),
						disabled: !row.getCanSelect(),
						indeterminate: row.getIsSomeSelected(),
						onChange: row.getToggleSelectedHandler(),
					}}
				/>
			</CheckboxDiv>
		),
	});

	return [selectorCol, ...cols, addCol];
};

export function TableEditor({
	projectId,
	tableId,
}: Readonly<TableEditorProps>) {
	const [canva, canvaDispatch, dispatchWithTrigger] = useTableEditor(
		projectId,
		tableId
	);

	const router = useRouter();

	useEffect(() => {
		if (canva.tableId != tableId) {
			// [projectId/data/[tableId]]
			router.push(
				`${window.location.origin}/${projectId}/data/${canva.tableId}`
			);
		}
	}, [canva]);

	return (
		<div className="editor-container">
			{/* Shows list of tables available */}
			<TableEditorSidebar
				projectId={projectId}
				tableId={canva.tableId}
				onChange={canvaDispatch}
			/>
			{/* Canva for editing selected table */}
			{tableId ? (
				<TableCanva
					state={canva}
					dispatch={canvaDispatch}
					dispatchForceTrigger={dispatchWithTrigger}
				/>
			) : (
				<div
					style={{
						display: "flex",
						justifyContent: "center",
						flexGrow: 1,
						alignItems: "center",
						height: "100vh",
						fontSize: "20px",
						color: "#333",
						backgroundColor: "#f5f5f5",
					}}
				>
					Select a Table
				</div>
			)}
			{canva.isRowConfigOpen && (
				<RowConfigMenu
					projectId={projectId}
					tableId={tableId}
					rowProps={canva.data?.columns ?? []}
					duplicationCheck={(val) =>
						checkDuplicateColumnLabel(
							val,
							canva.data?.columns ?? []
						)
					}
					isOpen={canva.isRowConfigOpen}
					dispatch={canvaDispatch}
					dispatchWithTrigger={dispatchWithTrigger}
				/>
			)}

			{canva.isColumnConfigOpen && (
				<div className={`column-config-menu`}>
					<ColumnConfigMenu
						projectId={projectId}
						tableId={tableId}
						isOpen={canva.isColumnConfigOpen}
						duplicationCheck={(val) =>
							checkDuplicateColumnLabel(
								val,
								canva.data?.columns ?? []
							)
						}
						dispatch={canvaDispatch}
						dispatchWithTrigger={dispatchWithTrigger}
					/>
				</div>
			)}
		</div>
	);
}

function IndeterminateCheckbox({
	indeterminate,
	className = "",
	...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
	const ref = useRef<HTMLInputElement>(null!);

	useEffect(() => {
		if (typeof indeterminate === "boolean") {
			ref.current.indeterminate = !rest.checked && indeterminate;
		}
	}, [ref, indeterminate]);

	return (
		<input
			type="checkbox"
			ref={ref}
			className={className + " cursor-pointer"}
			{...rest}
		/>
	);
}

const CheckboxDiv = ({ children }) => (
	<div style={{ textAlign: "center" }}>{children}</div>
);

const TextDiv = ({ children, centerAlign = false }) => (
	<div
		style={{
			display: "flex",
			padding: "5px",
			alignItems: "center",
			minWidth: "fit-content",
			whiteSpace: "nowrap",
			textAlign: centerAlign ? "center" : "initial",
			flex: "1",
		}}
	>
		{children}
	</div>
);

const HeaderDiv = ({ children }) => (
	<div
		style={{
			display: "flex",
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-around",
		}}
	>
		{children}
	</div>
);
