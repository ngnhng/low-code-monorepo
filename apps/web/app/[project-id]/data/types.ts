interface TableData {
	columns: ColumnProps[];
	rows?: RowProps[];
}

type ColumnProps = {
	key: string;
	label: string;
	type: string;
	role?: string;
};

type RowProps = {
	[key: string]: string;
};

type CanvaAction =
	| { type: "open-config-add-column" }
	| { type: "open-config-insert-row" }
	| { type: "close-config" }
	| { type: "open-config" }
	| { type: "edit-config" }
	| {
			type: "add-column";
			isSaved?: boolean;
			isError?: boolean;
	  }
	| { type: "add-row" }
	| { type: "remove-column" }
	| { type: "remove-row" }
	| { type: "select-table"; tableId: string }
	| { type: "set-data"; payload?: TableData; isError?: boolean }
	| { type: "open-database-query-builder" }
	| { type: "close-database-query-builder" };

type CanvaState = {
	isLoaded?: boolean;
	isLoading?: boolean;
	isSaving?: boolean;
	isModified?: boolean;

	isRowConfigOpen?: boolean;
	isColumnConfigOpen?: boolean;
	isQueryBuilderOpen?: boolean;

	isError?: boolean;
	errorMessage?: string;

	isQueryApplied?: boolean;
	query?: Record<string, any>;

	tableId: string;
	projectId: string;
	data?: TableData;
};

type TableEditorProps = {
	projectId: string;
	tableId: string;
};

type TableCanvaProps = {
	state: CanvaState;
	dispatch: any;
	dispatchForceTrigger: any;
};

const ID_COLUMN = "id";
const SELECTOR_COLUMN = "selector";

export type {
	TableData,
	ColumnProps,
	RowProps,
	CanvaAction,
	CanvaState,
	TableEditorProps,
	TableCanvaProps,
};

export { ID_COLUMN, SELECTOR_COLUMN };
