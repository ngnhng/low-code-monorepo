"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { mockApiBuilder } from "../utils";

type Table = {
   id: string;
   name: string;
};
const fetcher = (url) => fetch(url).then((res) => res.json());

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
export function TableEditorSidebar({ projectId, tableId, onChange }) {
   const { tables, error } = useTableList(projectId);
   const handleKeyDown = (event, table) => {
      if (event.key === "Enter") {
         onChange({ type: "select-table", tableId: table.id });
      }
   };

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
                     onKeyDown={(event) => handleKeyDown(event, table)}
                  >
                     {table.name}
                  </li>
               ))
            ) : (
               <div>Loading...</div>
            )}
         </ul>
         <style jsx>{`
            .sidebar {
               padding: 30px;
               max-width: 220px;
               min-width: 200px;
               background-color: rgb(var(--background));
            }
            h3 {
               margin-bottom: 20px;
            }
            .table-list {
               list-style-type: none;
               padding: 0;
            }
            .table-list .table-item {
               padding: 10px;
               border: 1px solid #ddd;
               margin-bottom: 10px;
               cursor: pointer;
               border-radius: 5px;
            }
            .table-list .table-item.selected {
               background-color: #ddd;
            }
            .table-list .table-item:hover {
               background-color: #eee;
            }
         `}</style>
      </div>
   );
}
