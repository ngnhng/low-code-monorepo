"use client";
import { useTableList } from "./TableEditor";

export function TableEditorSidebar({ projectId, tableId, onChange }) {
	const { tables, error } = useTableList(projectId);

	return (
		<div
			className="sidebar"
			style={{ padding: "30px", maxWidth: "220px", minWidth: "200px" }}
		>
			<h3>Tables</h3>
			<ul className="table-list">
				{error ? <div>Failed to load</div> : <></>}
				{tables ? (
					tables.map((table) => (
						<li
							key={table.id}
							className={`table-item ${table.id === tableId ? "selected" : ""}`}
							onClick={() => onChange({ type: "select-table", tableId: table.id })}
						>
							{table.name}
						</li>
					))
				) : (
					<div>Loading...</div>
				)}
			</ul>
		</div>
	);
}
