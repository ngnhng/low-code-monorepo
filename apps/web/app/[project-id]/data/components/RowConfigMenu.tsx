"use client";
import { Dispatch, Reducer, useReducer, useState } from "react";
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
         {inputWarning.isWarning ? (
            <div>{inputWarning.warningMessage}</div>
         ) : (
            <></>
         )}

         {error !== "" ? <div>{error}</div> : <></>}
         <button
            onClick={handleInsertRow}
            disabled={error !== "" || inputWarning.isWarning}
         >
            Insert Row
         </button>
         <button onClick={() => dispatch({ type: "close-config" })}>
            Close
         </button>

         <style jsx>{`
            .row-config-menu {
               position: absolute;
               top: 0;
               left: 0;
               width: 100%;
               height: 100%;
               background-color: rgba(0, 0, 0, 0.5);
               display: flex;
               flex-direction: column;
               justify-content: center;
               align-items: center;
               z-index: 100;
               opacity: 0;
               pointer-events: none;
               transition: all 0.3s ease;
            }

            .row-config-menu.open {
               opacity: 1;
               pointer-events: all;
            }

            .row-config-menu > button {
               margin: 10px;
               padding: 10px;
               border-radius: 5px;
               border: 1px solid #ccc;
               background-color: #fff;
               cursor: pointer;
            }
         `}</style>
      </div>
   );
}
