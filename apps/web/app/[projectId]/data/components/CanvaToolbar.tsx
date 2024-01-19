import { Dropdown } from "./Dropdown";

export function CanvaToolbar({ state, dispatch }) {
	return (
		<div
			className="canva-toolbar"
			style={{
				backgroundColor: "rgb(var(--secondary))",
				display: "flex",
				flexDirection: "row",
				justifyContent: "flex-start",
				alignItems: "center",
				padding: "10px",
				zIndex: "3",
				maxHeight: "30px",
			}}
		>
			<InsertToolbarItem dispatch={dispatch} />
			<QueryBuilderToolbarItem
				dispatch={dispatch}
				isQueryBuilderOpen={state.isQueryBuilderOpen}
			/>
		</div>
	);
}

const InsertToolbarItem = ({ dispatch }) => (
	<div className="insert-toolbar-item" style={{ margin: "10px" }}>
		<Dropdown
			title={"Insert"}
			dispatch={dispatch}
			options={[
				{
					value: "column",
					label: "Column",
					description: "Add New Column",
					dispatcher: "open-config-add-column",
				},
				{
					value: "row",
					label: "Row",
					description: "Add New Row",
					dispatcher: "open-config-insert-row",
				},
			]}
			onSelect={() => dispatch({ type: "close-config" })}
		/>
	</div>
);

const QueryBuilderToolbarItem = ({ dispatch, isQueryBuilderOpen }) => (
	<div className="query-builder-toolbar-item" style={{ margin: "10px" }}>
		<button
			onClick={() =>
				dispatch({
					type: isQueryBuilderOpen
						? "close-database-query-builder"
						: "open-database-query-builder",
				})
			}
		>
			Query Builder
		</button>
	</div>
);
