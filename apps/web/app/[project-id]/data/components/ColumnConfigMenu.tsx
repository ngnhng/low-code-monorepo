"use client";
import { Dispatch, Reducer, useReducer, useState } from "react";
import { ColumnProps } from "../../../../interfaces/TableData";
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
      case "column-label-duplication":
         return {
            ...state,
            isWarning: true,
            warningMessage: "Column Label Already Exists",
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

export function ColumnConfigMenu({
   projectId,
   tableId,
   isOpen,
   duplicationCheck,
   dispatch,
   dispatchWithTrigger,
}) {
   const [columnKey, setColumnKey] = useState("");
   const [columnLabel, setColumnLabel] = useState("");
   const [dataType, setDataType] = useState("text");
   const [defaultValue, setDefaultValue] = useState("NULL");

   const [inputWarning, dispatchInputWarning] = useInputWarning();
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState("");

   const handleAddColumn = async () => {
      const newColumn: ColumnProps = {
         key: columnLabel.toLowerCase(),
         label: columnLabel,
         type: dataType,
      };

      setIsLoading(true);

      const result = await axios
         .post(
            `${mockApiBuilder(projectId)}/data/${tableId}/columns`,
            newColumn
         )
         .then((res) => res.status === 200)
         .catch((_) => {
            setError("Error Adding Column");
            setIsLoading(false);
         });

      if (result) {
         dispatchWithTrigger({ type: "add-column", isSaved: true });
         setError("");
      }

      setIsLoading(false);
      dispatch({ type: "close-config" });
   };

   if (isLoading) {
      return <div>Loading...</div>;
   }

   return (
      <div className={`column-config-menu ${isOpen ? "open" : ""}`}>
         <div
            className="column-config-menu__header"
            style={{
               position: "fixed",
               top: 0,
               width: "100%",
               margin: "20px",
               borderBottom: "1px solid var(--puck-color-neutral-3)",
            }}
         >
            Add new column
         </div>
         <FixedBar
            warningMessage={inputWarning.warningMessage}
            onSave={handleAddColumn}
            onCancel={() => dispatch({ type: "close-config" })}
         />
         <div className={`column-options`}>
            <ColumnOption label="General">
               <div className="column-input__label">Column Name</div>
               <input
                  type="text"
                  value={columnLabel}
                  onChange={(e) => {
                     setColumnLabel(e.target.value);
                     if (duplicationCheck(e.target.value)) {
                        dispatchInputWarning({
                           type: "column-label-duplication",
                        });
                     } else {
                        dispatchInputWarning({ type: "clear" });
                     }
                  }}
               />
            </ColumnOption>

            <ColumnOption label="Data Type">
               <div className="column-input__label">Type</div>
               <select
                  value={dataType}
                  onChange={(e) => setDataType(e.target.value.toLowerCase())}
               >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="boolean">Boolean</option>
               </select>

               <div className="column-input__label">Default Value</div>

               <input
                  type="text"
                  value={defaultValue}
                  onChange={(e) => setDefaultValue(e.target.value)}
               />
            </ColumnOption>
         </div>
      </div>
   );
}

// A fixed button menu with waring logs, save and cancel buttons
function FixedBar({ warningMessage, onSave, onCancel }) {
   return (
      <div
         style={{
            position: "fixed",
            bottom: 0,
            width: "100%",
            borderTop: "1px solid var(--puck-color-neutral-3)",
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

const ColumnOption = ({ label, children }) => (
   <div
      className={`column-option`}
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
         className={`column-option-label`}
         style={{
            whiteSpace: "nowrap",
			flex: 1,
         }}
      >
         {label}
      </div>
      <div
         className="column-inputs"
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
