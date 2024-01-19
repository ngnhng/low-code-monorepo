"use client";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
	ColumnResizeMode,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { ID_COLUMN, SELECTOR_COLUMN } from "../types";
import { parseColumns } from "./table-editor";

export function TableRenderer({ data, dispatch }) {
	const columnHelper = useMemo(() => createColumnHelper(), []);
	const [columnResizeMode, setColumnResizeMode] =
		useState<ColumnResizeMode>("onChange");

	const columns = useMemo(() => {
		return parseColumns(columnHelper, data?.columns ?? [], dispatch);
	}, [data]);

	const rows = useMemo(() => {
		return data?.rows ?? [];
	}, [data]);

	const coreRowModel = getCoreRowModel();

	const table = useReactTable({
		data: rows,
		columns,
		columnResizeMode,
		getCoreRowModel: coreRowModel,
	});

	if (!data) {
		return <div>Loading...</div>;
	}

	return (
		<div
			className={"table"}
			onMouseUp={() => {
				if (columnResizeMode === "onEnd") {
					setColumnResizeMode("onChange");
				}
			}}
			style={{
				border: "1px solid #ddd",
			}}
		>
			<table
				{...{
					style: {
						width: table.getCenterTotalSize(),
					},
				}}
			>
				<thead>
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<th
									key={header.id}
									{...{
										colSpan: header.colSpan,
										style: {
											width:
												header.id !== SELECTOR_COLUMN
													? header.getSize()
													: "100px",
										},
									}}
								>
									{" "}
									<div
										className="header-cell"
										style={{
											display: "flex",
											alignItems: "center",
											justifyContent:
												header.column.id ===
												SELECTOR_COLUMN
													? "center"
													: "space-between",
											height: "24px",
										}}
									>
										{header.isPlaceholder ? null : (
											<div>
												{flexRender(
													header.column.columnDef
														.header,
													header.getContext()
												)}
											</div>
										)}

										{header.id != SELECTOR_COLUMN && (
											<div
												onMouseDown={header.getResizeHandler()}
												onTouchStart={header.getResizeHandler()}
												className={`resizer ${
													header.column.getIsResizing()
														? "isResizing"
														: ""
												}`}
												{...{
													style: {
														transform:
															columnResizeMode ===
																"onEnd" &&
															header.column.getIsResizing()
																? `translateX(${
																		table.getState()
																			.columnSizingInfo
																			.deltaOffset
																  }px)`
																: "",
													},
												}}
											/>
										)}
									</div>
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows.map((row, index) => (
						<tr key={row.id}>
							{row.getVisibleCells().map((cell) => {
								return cell.column.id !== SELECTOR_COLUMN &&
									cell.column.id !== ID_COLUMN ? (
									<td key={cell.id}>
										{flexRender(
											cell.column.columnDef.cell,
											cell.getContext()
										)}
									</td>
								) : (
									<th key={cell.id}>
										{flexRender(
											cell.column.columnDef.cell,
											cell.getContext()
										)}
									</th>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
