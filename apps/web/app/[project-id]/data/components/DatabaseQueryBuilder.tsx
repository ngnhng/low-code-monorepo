import { useState } from "react";
import { formatQuery, QueryBuilder } from "react-querybuilder";
import "react-querybuilder/dist/query-builder.css";
import Drawer from "./Drawer";

export function DatabaseQueryBuilder({
	projectId,
	tableId,
	isOpen,
	dispatch,
	dispatchWithTrigger,
}) {
	const [query, setQuery] = useState(null);

	const handleQueryChange = (newQuery) => {
		setQuery(newQuery);
		// You can also dispatch an action here to update the query in your state management system
	};

	// TODO: move query to the dropdown 
	// make header and bottom control sticky
	// rework canva menu buttons
	return (
		isOpen && (
			<div
				className="query-builder__wrapper"
				style={{
					maxHeight: "235px",
					transition: "height 0.5s ease-in-out",
					height: isOpen ? "auto" : "0",
					padding: "20px",
					display: "flex",
				}}
			>
				<div
					className="query-builder__queries"
					style={{
						flex: 1,
						overflow: "auto",
					}}
				>
					<QueryBuilder
						fields={
							[
								// Define your fields here
							]
						}
						onQueryChange={handleQueryChange}
					/>
				</div>
				<div
					className="query-builder__actions"
					style={{
						flex: 0.5,
						paddingLeft: "20px",
						overflow: "hidden",
					}}
				>
					<div>
						<input
							type={"text"}
							placeholder={"Name your query"}
						></input>
					</div>
				</div>
			</div>
		)
	);
}
