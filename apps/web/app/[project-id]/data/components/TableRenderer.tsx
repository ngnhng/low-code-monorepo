"use client";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
	ColumnResizeMode
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { parseColumns } from "./TableEditor";

export function TableRenderer({ data, dispatch }) {
	const columnHelper = useMemo(() => createColumnHelper(), []);
	const [columnResizeMode, setColumnResizeMode] = useState<ColumnResizeMode>("onChange");

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
			style={{
				width: "100vh",
				height: "100%",
				overflowX: "scroll",
				overflowY: "auto",
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
								<>
									<th
										key={header.id}
										colSpan={header.colSpan}
										style={{
											border: "1px solid black",
											width: header.getSize(),
										}}
									>
										{header.isPlaceholder ? null : (
											<>
												<div>
													{flexRender(
														header.column.columnDef.header,
														header.getContext()
													)}
												</div>
											</>
										)}

										<div
											onMouseDown={header.getResizeHandler()}
											onTouchStart={header.getResizeHandler()}
											className={`resizer ${header.column.getIsResizing()
													? "isResizing"
													: ""}`}
											style={{
												transform: columnResizeMode === "onEnd" &&
													header.column.getIsResizing()
													? `translateX(${table.getState().columnSizingInfo
														.deltaOffset}px)`
													: "",
											}} />
									</th>
								</>
							))}
						</tr>
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows.map((row, index) => (
						<tr key={row.id}>
							{row.getVisibleCells().map((cell) => (
								<td
									key={cell.id}
									style={{
										textAlign: "left",
										paddingLeft: "20px",
										border: "1px solid black",
									}}
								>
									{flexRender(
										cell.column.columnDef.cell,
										cell.getContext()
									)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
