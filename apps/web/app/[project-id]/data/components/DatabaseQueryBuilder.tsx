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

	return (
		isOpen && (
			<div className="modal">
				<Drawer
					anchor="right"
					dispatch={dispatch}
					onClose={() => {
						dispatch({ type: "close-database-query-builder" });
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
					{/*<div> {formatQuery(query ?? "",)}</div>*/}
				</Drawer>
				<style jsx>
					{`
						.modal {
							left: 0;
							position: fixed;
							top: 0;

							height: 100%;
							width: 100%;

							background: rgba(51 65 85 / 0.7);
							z-index: 999;
						}
					`}
				</style>
			</div>
		)
	);
}
