"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";

type Table = {
   id: string;
   name: string;
};

const mockApiBuilder = (projectId: string) => {
   const base = process.env["NEXT_PUBLIC_BASE_URL"];
   return `${base}/api/mock/${projectId}`;
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
