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
         {inputWarning.isWarning ? (
            <div>{inputWarning.warningMessage}</div>
         ) : (
            <></>
         )}

         {error !== "" ? <div>{error}</div> : <></>}

         <button
            onClick={handleAddColumn}
            disabled={error !== "" || inputWarning.isWarning}
         >
            Add Column
         </button>
         <button onClick={() => dispatch({ type: "close-config" })}>
            Close
         </button>
         <div className={`column-options`}>
            <div className={`column-option`}>
               <div className={`column-option-label`}>Column Name</div>
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

               <div className={`column-option-label`}>Data Type</div>
               <select
                  value={dataType}
                  onChange={(e) => setDataType(e.target.value.toLowerCase())}
               >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="boolean">Boolean</option>
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
