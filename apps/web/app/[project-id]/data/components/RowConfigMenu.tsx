"use client";
import { Dispatch, Reducer, useEffect, useReducer, useState } from "react";
import { ColumnProps, RowProps } from "../../../../interfaces/TableData";
import axios from "axios";

const mockApiBuilder = (projectId: string) => {
   const base = process.env["NEXT_PUBLIC_BASE_URL"];
   return `${base}/api/mock/${projectId}`;
};

type MenuState = {
   isWarning?: boolean;
   warningMessage?: string;
};

type MenuAction = {
   type: string;
};

const menuWarningReducer: Reducer<MenuState, MenuAction> = (state, action) => {
   switch (action.type) {
      case "invalid-value":
         return {
            ...state,
            isWarning: true,
            warningMessage: "Invalid Value",
         };

      case "clear":
         return { ...state, isWarning: false, warningMessage: "" };

      default:
         return { ...state, isWarning: false, warningMessage: "" };
   }
};

function useInputWarning(): [MenuState, Dispatch<MenuAction>] {
   const [state, dispatch] = useReducer(menuWarningReducer, {});

   return [state, dispatch];
}

export function RowConfigMenu({
   projectId,
   tableId,
   rowProps,
   isOpen,
   duplicationCheck,
   dispatch,
   dispatchWithTrigger,
}) {
   const [inputWarning, dispatchInputWarning] = useInputWarning();
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState("");

   const [newRow, setNewRow] = useState(
      rowProps?.map((column) => {
         return {
            ...column,
            value: "",
         };
      })
   );

   useEffect(() => {}, [newRow]);

   const handleInsertRow = async () => {
      if (rowProps === undefined) {
         return;
      }

      const { data } = await axios.post(
         `${mockApiBuilder(projectId)}/data/${tableId}/row`,
         {
            row: rowProps,
         }
      );

      if (data.error) {
         setError(data.error);
      } else {
         dispatchWithTrigger({
            type: "insert-row",
            row: data.row,
         });
         dispatch({ type: "close-config" });
      }
   };

   return (
      <div className={`row-config-menu ${isOpen ? "open" : ""}`}>
         <FixedBar
            warningMessage={inputWarning.warningMessage}
            onSave={handleInsertRow}
            onCancel={() => dispatch({ type: "close-config" })}
         />

         <div className="row-config-inputs">
            {rowProps?.map((column, index) => {
               return (
                  <RowOption
                     label={column.label}
                     type={column.type}
                     key={index}
                  >
                     <input
                        type="text"
                        value={newRow[index]?.value ?? ""}
                        onChange={(e) => {
                           setNewRow([
                              ...newRow.slice(0, index),
                              { ...newRow[index], value: e.target.value },
                              ...newRow.slice(index + 1),
                           ]);
                        }}
                     />
                  </RowOption>
               );
            })}
         </div>
      </div>
   );
}

function FixedBar({ warningMessage, onSave, onCancel }) {
   return (
      <div
         style={{
            position: "fixed",
            bottom: 0,
            width: "100%",
            borderTop: "1px solid var(--puck-color-neutral-3)",
            backgroundColor: "var(--puck-color-rose-8)",
         }}
      >
         {warningMessage && <p>{warningMessage}</p>}
         <div
            style={{
               display: "flex",
               justifyContent: "flex-start",
               alignItems: "center",
            }}
         >
            <button
               onClick={onSave}
               style={{
                  margin: "5px",
                  backgroundColor: "var(--puck-color-azure-3)",
               }}
            >
               Save
            </button>
            <button
               onClick={onCancel}
               style={{
                  margin: "5px",
                  backgroundColor: "var(--puck-color-azure-3)",
               }}
            >
               Cancel
            </button>
         </div>
      </div>
   );
}

const RowOption = ({ label, type, children }) => (
   <div
      className={`row-option`}
      style={{
         marginTop: "50px",
         display: "flex",
         flexDirection: "row",
         justifyContent: "space-between",
         padding: "20px",
         borderBottom: "1px solid var(--puck-color-neutral-3)",
      }}
   >
      <div
         className={`row-option-label`}
         style={{
            whiteSpace: "nowrap",
            flex: 1,
         }}
      >
         {label}
         <div
            style={{ fontSize: "12px", color: "var(--puck-color-neutral-5)" }}
         >
            {type}
         </div>
      </div>
      <div
         className="row-input"
         style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            flex: 2,
         }}
      >
         {children}
      </div>
   </div>
);
