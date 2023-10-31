"use client";

import { Reducer, useEffect, useReducer, useState } from "react";
import useSWR from "swr";
import "./style.css";

const mockApiBuilder = (projectId: string) => {
   const base = process.env["NEXT_PUBLIC_BASE_URL"];
   return `${base}/api/mock/${projectId}`;
};

type CanvaAction =
   | { type: "open-config" }
   | { type: "edit-config" }
   | { type: "add-column" }
   | { type: "add-row" }
   | { type: "remove-column" }
   | { type: "remove-row" }
   | { type: "select-table"; tableId: string };

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
   isLoaded: boolean;
   isLoading: boolean;
   isSaving: boolean;

   isConfigOpen: boolean;

   isError: boolean;
   errorMessage: string;

   tableId: string;
   data: TableData;
};

type TableEditorProps = {
   projectId: string;
   tableId: string;
};

type TableCanvaProps = {};

const canvaReducer: Reducer<CanvaState, CanvaAction> = (state, action) => {
   switch (action.type) {
      case "open-config":
         return { ...state, isConfigOpen: true };
      case "edit-config":
         return { ...state, isConfigOpen: true };
      case "add-column":
         return { ...state, isConfigOpen: true };
      case "add-row":
         return { ...state, isConfigOpen: true };
      case "remove-column":
         return { ...state, isConfigOpen: true };
      case "remove-row":
         return { ...state, isConfigOpen: true };
      case "select-table":
         return { ...state, tableId: action.tableId };
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

const useTableEditor = (projectId, tableId) => {
   const [canvaState, canvaDispatch] = useReducer(
      canvaReducer,
      getInitialState()
   );
   const [configState, configDispatch] = useReducer(
      editorConfigReducer,
      getInitialState()
   );
   // Fetch table data
   useEffect(() => {}, [projectId, tableId]);

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

export function TableCanva(props: TableCanvaProps) {
   return (
      <div className="canva">
         <CanvaToolbar />
         <Table />
      </div>
   );
}

function CanvaToolbar() {
   return <div className="canva-toolbar">Toolbar</div>;
}

function Table() {
   return <div className="table-container">Table</div>;
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

const fetcher = (url) => fetch(url).then((res) => res.json());

const useTableList = (projectId: string) => {
   const [tables, setTables] = useState<Table[]>([]);
   const { data, error } = useSWR(
      `${mockApiBuilder(projectId)}/data/all`,
      fetcher
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
      <div className="sidebar">
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
                     onClick={() => onChange({ type: "select-table", tableId })}
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

   const [isConfigOpen, setIsConfigOpen] = useState(false);

   useEffect(() => {}, []);

   return (
      <div className="editor-container">
         {/* Shows list of tables available */}
         <TableEditorSidebar
            projectId={projectId}
            tableId={canva.tableId}
            onChange={canvaDispatch}
         />
         {/* Canva for editing selected table */}
         <TableCanva />
         <button
            onClick={() => {
               setIsConfigOpen(true);
            }}
         >
            Open Config Menu
         </button>
         {/* Config menu for current editing table */}
         <EditorConfigMenu isOpen={isConfigOpen} onClose={setIsConfigOpen} />
      </div>
   );
}

function getInitialState(): CanvaState {
   return {
      isLoaded: false,
      isLoading: false,
      isSaving: false,

      isConfigOpen: false,

      isError: false,
      errorMessage: "",

      tableId: "",
      data: {
         columns: [],
         rows: [],
      },
   };
}
