"use client";
import { useState } from "react";


export function ColumnConfigMenu({ isOpen, onClose, dispatch }) {
	const [columnName, setColumnName] = useState("");
	const [dataType, setDataType] = useState("Text");
	const [defaultValue, setDefaultValue] = useState("");

	const handleAddColumn = () => {
		dispatch({
			type: "open-config-add-column",
			payload: { columnName, dataType, defaultValue },
		});
		onClose();
	};
	return (
		<div className={`column-config-menu ${isOpen ? "open" : ""}`}>
			<button onClick={handleAddColumn}>Add Column</button>
			<button onClick={onClose}>Close</button>
			<div className={`column-options`}>
				<div className={`column-option`}>
					<div className={`column-option-label`}>Column Name</div>
					<input
						type="text"
						value={columnName}
						onChange={(e) => setColumnName(e.target.value)} />

					<div className={`column-option-label`}>Data Type</div>
					<select
						value={dataType}
						onChange={(e) => setDataType(e.target.value)}
					>
						<option>Text</option>
						<option>Number</option>
						<option>Date</option>
						<option>Boolean</option>
						<option>Image</option>
						<option>File</option>
					</select>

					<div className={`column-option-label`}>Default Value</div>
					<input
						type="text"
						value={defaultValue}
						onChange={(e) => setDefaultValue(e.target.value)} />
				</div>
			</div>
		</div>
	);
}
