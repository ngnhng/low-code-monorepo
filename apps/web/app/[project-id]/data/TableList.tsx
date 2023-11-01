"use client";

import {
   ColumnHelper,
   createColumnHelper,
   flexRender,
   getCoreRowModel,
   useReactTable,
   getSortedRowModel,
   getFacetedRowModel,
   getFacetedMinMaxValues,
   getFacetedUniqueValues,
   FilterFn,
   sortingFns,
   ColumnFiltersState,
   getFilteredRowModel,
   getPaginationRowModel,
   Table,
   Column,
   ColumnDef,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

const mockApiBuilder = (projectId: string) => {
   const base = process.env["NEXT_PUBLIC_BASE_URL"];
   return `${base}/api/mock/${projectId}`;
};

type TableListItem = {
   id: string;
   name: string;
   dateCreated: string;
   dateModified: string;
};

const defaultColumns: ColumnDef<TableListItem>[] = [
   {
      header: "ID",
      accessorFn: (row) => row.id,
   },
   {
      header: "Name",
      accessorFn: (row) => row.name,
   },
   {
      header: "Date Created",
      accessorFn: (row) => row.dateCreated,
   },
   {
      header: "Date Modified",
      accessorFn: (row) => row.dateModified,
   },
];

export function TableList({ projectId }) {
   const { data, error } = useSWR(
      `${mockApiBuilder(projectId)}/data/all`,
      fetcher,
      {
         revalidateIfStale: false,
         revalidateOnFocus: false,
      }
   );

   const [columns] = useState<typeof defaultColumns>(() => [...defaultColumns]);

   const rows = useMemo(() => {
      return data?.map((row) => {
         return {
            id: row.id,
            name: row.name,
            dateCreated: row.dateCreated,
            dateModified: row.dateModified,
         };
      });
   }, [data]);

   const coreRowModel = getCoreRowModel<TableListItem>();

   const table = useReactTable({
      data: rows,
      columns,
      getCoreRowModel: coreRowModel,
   });

   if (error) return <div>failed to load</div>;

   if (!data) return <div>loading...</div>;

   return (
      <div style={{ padding: "50px" }}>
         <List
            table={table}
            style={{ width: "100%", height: "100%", position: "relative" }}
            className="table"
         />
      </div>
   );
}

function List({ table, style, className }) {
   const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
   const router = useRouter();

   return (
      <div className={className} style={style}>
         <table style={{ width: "100%", border: "1px solid black" }}>
            <thead>
               {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                     {headerGroup.headers.map((header) => (
                        <>
                           <th key={header.id} colSpan={header.colSpan}>
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
                           </th>
                        </>
                     ))}
                  </tr>
               ))}
            </thead>
            <tbody>
               {table.getRowModel().rows.map((row, index) => (
                  <tr
                     key={row.id}
                     onMouseEnter={() => setHoveredRowIndex(index)}
                     onMouseLeave={() => setHoveredRowIndex(null)}
                     style={
                        index === hoveredRowIndex
                           ? { backgroundColor: "lightgray" }
                           : {}
                     }
                     onClick={() => {
                        router.push(
                           `${window.location.href}/${row.original.id}`
                        );
                     }}
                  >
                     {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} style={{ textAlign: "center" }}>
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
