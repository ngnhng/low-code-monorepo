"use client";

import {
   ColumnHelper,
   createColumnHelper,
   flexRender,
   getCoreRowModel,
   useReactTable,
   ColumnResizeMode,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { Reducer, useEffect, useMemo, useReducer, useState } from "react";
import useSWR from "swr";
import "./style.css";

const mockApiBuilder = (projectId: string) => {
   const base = process.env["NEXT_PUBLIC_BASE_URL"];
   return `${base}/api/mock/${projectId}`;
};

const fetcher = (url) => fetch(url).then((res) => res.json());

type CanvaAction =
   | { type: "open-config-add-column" }
   | { type: "open-config-insert-row" }
   | { type: "open-config" }
   | { type: "edit-config" }
   | { type: "add-column" }
   | { type: "add-row" }
   | { type: "remove-column" }
   | { type: "remove-row" }
   | { type: "select-table"; tableId: string }
   | { type: "set-data"; payload?: TableData; isError?: boolean };

type TableData = {
   columns: string[];
   rows: string[];
};

type EditorConfigMenuProps = {
   isOpen: boolean;
   configItems?: EditorConfigMenuItem[];

   onClose: any;

   onEdit?: () => void;

   onAddColumn?: () => void;

   onAddRow?: () => void;

   onRemoveColumn?: () => void;

   onRemoveRow?: () => void;

   onSave?: () => void;
};

type EditorConfigMenuItem = {
   type: "data-type" | "name";
   title: string;
   icon?: string;

   onChange: (event: any) => void;
};

type EditorConfigMenuAction =
   | { type: "open-config" }
   | { type: "edit-config" }
   | { type: "add-column" }
   | { type: "add-row" }
   | { type: "remove-column" }
   | { type: "remove-row" };

type EditorConfigMenuState = {
   [configItem: string]: any;
};

type CanvaState = {
   isLoaded?: boolean;
   isLoading?: boolean;
   isSaving?: boolean;

   isRowConfigOpen?: boolean;
   isColumnConfigOpen?: boolean;

   isError?: boolean;
   errorMessage?: string;

   tableId: string;
   data?: TableData;
};

type TableEditorProps = {
   projectId: string;
   tableId: string;
};

type TableCanvaProps = {
   state: CanvaState;
   dispatch: any;
   setRowConfig: any;
   setColumnConfig: any;
};

const canvaReducer: Reducer<CanvaState, CanvaAction> = (state, action) => {
   switch (action.type) {
      case "open-config-add-column":
         return { ...state, isColumnConfigOpen: true };
      case "open-config-insert-row":
         return { ...state, isRowConfigOpen: true };
      case "edit-config":
         return { ...state };
      case "add-column":
         return { ...state };
      case "add-row":
         return { ...state };
      case "remove-column":
         return { ...state };
      case "remove-row":
         return { ...state };
      case "select-table": // change table
         return { ...state, tableId: action.tableId };
      case "set-data":
         return { ...state, data: action.payload };
      default:
         throw new Error();
   }
};

const editorConfigReducer: Reducer<
   EditorConfigMenuState,
   EditorConfigMenuAction
> = (state, action) => {
   switch (action.type) {
      case "open-config":
         return { ...state, isConfigOpen: true };
      case "edit-config":
         return { ...state, isConfigOpen: true };
      case "add-row":
         return { ...state, isConfigOpen: true };
      case "remove-column":
         return { ...state, isConfigOpen: true };
      case "remove-row":
         return { ...state, isConfigOpen: true };
      default:
         throw new Error();
   }
};

const fetchTable = async (projectId: string, tableId: string) => {
   const data = await fetch(
      `${mockApiBuilder(projectId)}/data/${tableId}`
   ).then((res) => res.json());
   return data;
};

const useTableEditor = (projectId, tableId) => {
   const [canvaState, canvaDispatch] = useReducer(canvaReducer, {
      tableId: tableId,
   });
   const [configState, configDispatch] = useReducer(editorConfigReducer, {});
   // Fetch table data
   useEffect(() => {
      const fetchTableData = async () => {
         if (projectId && tableId) {
            const data = await fetchTable(projectId, tableId);
            if (data) {
               canvaDispatch({
                  type: "set-data",
                  payload: data,
               });
            } else {
               canvaDispatch({
                  type: "set-data",
                  isError: true,
               });
            }
         }
      };
      fetchTableData();
   }, [projectId, tableId]);

   return [canvaState, canvaDispatch, configState, configDispatch] as const;
};

export function EditorConfigMenu({ isOpen, onClose }: EditorConfigMenuProps) {
   const [configItems, setConfigItems] = useState<EditorConfigMenuItem[]>([]);

   const toggleConfigMenu = () => {
      onClose();
   };

   return (
      <div className={`config-menu ${isOpen ? "open" : ""}`}>
         <button onClick={toggleConfigMenu}>
            {isOpen ? "Close Config Menu" : "Open Config Menu"}
         </button>
      </div>
   );
}

export function RowConfigMenu({ isOpen, onClose, dispatch }) {
   return (
      <div className={`row-config-menu ${isOpen ? "open" : ""}`}>
         <button onClick={() => dispatch({ type: "open-config-insert-row" })}>
            Insert Row
         </button>
      </div>
   );
}

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
                  onChange={(e) => setColumnName(e.target.value)}
               />

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
                  onChange={(e) => setDefaultValue(e.target.value)}
               />
            </div>
         </div>
      </div>
   );
}

export function TableCanva({
   state,
   dispatch,
   setRowConfig,
   setColumnConfig,
}: TableCanvaProps) {
   return (
      <div className="canva">
         <CanvaToolbar />
         <TableRenderer data={state.data} dispatch={dispatch} />
      </div>
   );
}

const FilterToolbarItem = () => (
   <div className="filter-toolbar-item" style={{ margin: "10px" }}>
      <Dropdown
         title={"Filter"}
         options={[
            { value: "filter", label: "Filter" },
            { value: "sort", label: "Sort" },
         ]}
         onSelect={(value) => console.log(value)}
      />
   </div>
);

const InsertToolbatItem = () => (
   <div className="insert-toolbar-item" style={{ margin: "10px" }}>
      <Dropdown
         title={"Insert"}
         options={[
            { value: "column", label: "Column" },
            { value: "row", label: "Row" },
         ]}
         onSelect={(value) => console.log(value)}
      />
   </div>
);

const Dropdown = ({ title, options, onSelect }) => {
   const [isOpen, setIsOpen] = useState(false);
   const [selectedOption, setSelectedOption] = useState(null);

   return (
      <div className="dropdown">
         <div
            className="dropdown-toggle"
            onClick={() => setIsOpen((prev) => !prev)}
         >
            {title}
         </div>
         {isOpen && (
            <div className="dropdown-options">
               {options.map((option) => (
                  <DropdownOption
                     key={option.value}
                     value={option.value}
                     onSelect={onSelect}
                  >
                     {option.label}
                  </DropdownOption>
               ))}
            </div>
         )}
      </div>
   );
};

const DropdownOption = ({ value, children, onSelect }) => (
   <div onClick={() => onSelect(value)}>{children}</div>
);
function CanvaToolbar() {
   const [selectedTool, setSelectedTool] = useState(null);

   return (
      <div
         className="canva-toolbar"
         style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            padding: "10px",
            border: "1px solid black",
         }}
      >
         <FilterToolbarItem />
         <InsertToolbatItem />
      </div>
   );
}

type ColumnProps = {
   key: string;
   label: string;
   type: string;
   children?: ColumnProps[];
};

const parseColumns = (
   columnsHelper: ColumnHelper<unknown>,
   columns: ColumnProps[],
   onAddColumn?: any
) => {
   const cols = columns.map((column) => {
      return columnsHelper.accessor(column.key, {
         id: column.key,
         header: column.label,
         cell: (props) => {
            return <div>{props.getValue()}</div>;
         },
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
      cell: () => {
         return <div style={{ border: "1px dotted black" }}></div>;
      },
   });

   return [...cols, addCol];
};

function TableRenderer({ data, dispatch }) {
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
                                 className={`resizer ${
                                    header.column.getIsResizing()
                                       ? "isResizing"
                                       : ""
                                 }`}
                                 style={{
                                    transform:
                                       columnResizeMode === "onEnd" &&
                                       header.column.getIsResizing()
                                          ? `translateX(${
                                               table.getState().columnSizingInfo
                                                  .deltaOffset
                                            }px)`
                                          : "",
                                 }}
                              />
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

type TableListProps = {
   tables: Table[];
   selectedTable: Table;
   onSelectTable: (table: Table) => void;
};

type Table = {
   id: string;
   name: string;
};

const useTableList = (projectId: string) => {
   const [tables, setTables] = useState<Table[]>([]);
   const { data, error } = useSWR(
      `${mockApiBuilder(projectId)}/data/all`,
      fetcher,
      {
         revalidateIfStale: false,
         revalidateOnFocus: false,
      }
   );

   useEffect(() => {
      if (data) {
         setTables(data);
      } else if (error) {
         console.log(error);
      }
   }, [data, error]);

   return { tables, error };
};

function TableEditorSidebar({ projectId, tableId, onChange }) {
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
                     className={`table-item ${
                        table.id === tableId ? "selected" : ""
                     }`}
                     onClick={() =>
                        onChange({ type: "select-table", tableId: table.id })
                     }
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

export function TableEditor({ projectId, tableId }: TableEditorProps) {
   const [canva, canvaDispatch, config, configDispatch] = useTableEditor(
      projectId,
      tableId
   );

   const [isRowConfigOpen, setRowConfig] = useState(false);
   const [isColumnConfigOpen, setColumnConfig] = useState(false);
   const router = useRouter();

   useEffect(() => {
      if (canva.tableId != tableId) {
         router.push(
            `${window.location.href.split("/").slice(0, -1).join("/")}/${
               canva.tableId
            }`
         );
      }

      if (canva.isRowConfigOpen) {
         console.log("set row config");
         setRowConfig(true);
      } else if (canva.isColumnConfigOpen) {
         console.log("set column config");
         setColumnConfig(true);
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
         <TableCanva
            state={canva}
            dispatch={canvaDispatch}
            setRowConfig={setRowConfig}
            setColumnConfig={setColumnConfig}
         />

         <RowConfigMenu
            isOpen={isRowConfigOpen}
            onClose={() => setRowConfig(false)}
            dispatch={canvaDispatch}
         />
         <ColumnConfigMenu
            isOpen={isColumnConfigOpen}
            onClose={() => setColumnConfig(false)}
            dispatch={canvaDispatch}
         />
         {/* Config menu for editing table */}
         {/*<EditorConfigMenu
			isOpen={config.isConfigOpen}
			onClose={() => configDispatch({ type: "open-config" })}
			onEdit={() => configDispatch({ type: "edit-config" })}
			onAddColumn={() => configDispatch({ type: "add-column" })}
			onAddRow={() => configDispatch({ type: "add-row" })}
			onRemoveColumn={() => configDispatch({ type: "remove-column" })}
			onRemoveRow={() => configDispatch({ type: "remove-row" })}
			onSave={() => configDispatch({ type: "save" })}
		 />*/}
      </div>
   );
}
