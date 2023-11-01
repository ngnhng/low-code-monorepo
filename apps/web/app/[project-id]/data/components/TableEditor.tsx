"use client";

import { ColumnHelper } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { Reducer, useEffect, useReducer, useState } from "react";
import useSWR from "swr";
import { ColumnConfigMenu } from "./ColumnConfigMenu";
import { RowConfigMenu } from "./RowConfigMenu";
import "./style.css";
import { TableCanva } from "./TableCanva";
import { TableEditorSidebar } from "./TableEditorSidebar";

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

export type TableCanvaProps = {
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
         return {
            ...state,
            tableId: action.tableId,
            isColumnConfigOpen: false,
            isRowConfigOpen: false,
         };
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
export function CanvaToolbar() {
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

export const parseColumns = (
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

type TableListProps = {
   tables: Table[];
   selectedTable: Table;
   onSelectTable: (table: Table) => void;
};

type Table = {
   id: string;
   name: string;
};

export const useTableList = (projectId: string) => {
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
         setRowConfig(true);
      } else if (canva.isColumnConfigOpen) {
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
      </div>
   );
}
