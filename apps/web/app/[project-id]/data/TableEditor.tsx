"use client";

import { Reducer, useEffect, useReducer } from "react";

type TableEditorAction =
   | { type: "open-config" }
   | { type: "edit-config" }
   | { type: "add-column" }
   | { type: "add-row" }
   | { type: "remove-column" }
   | { type: "remove-row" };

type TableEditorData = {
   columns: string[];
   rows: string[];
};

type EditorConfigMenuProps = {};

type EditorConfigMenuAction = {};

type TableEditorState = {
   isLoaded: boolean;
   isLoading: boolean;
   isSaving: boolean;

   isConfigOpen: boolean;

   isError: boolean;
   errorMessage: string;

   data: TableEditorData;
};

type TableEditorProps = {};

const tableEditorReducer: Reducer<TableEditorState, TableEditorAction> = (
   state,
   action
) => {
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
      default:
         throw new Error();
   }
};

const useTableEditor = () => {
   const tableInitialState: TableEditorState = getInitialState();

   const [state, dispatch] = useReducer(tableEditorReducer, tableInitialState);

   useEffect(() => {}, []);

   return <></>;
};

export function EditorConfigMenu(props: EditorConfigMenuProps) {}

export function TableEditor(props: TableEditorProps) {}

function getInitialState(): TableEditorState {
   return {
      isLoaded: false,
      isLoading: false,
      isSaving: false,

      isConfigOpen: false,

      isError: false,
      errorMessage: "",

      data: {
         columns: [],
         rows: [],
      },
   };
}
