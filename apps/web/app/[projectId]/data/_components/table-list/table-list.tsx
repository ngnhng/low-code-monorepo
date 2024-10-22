"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Badge,
  DataTablePagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableRowButton,
} from "@repo/ui";
import { TableTextWithIcon } from "../../../../../components/text/text-with-icon";
import { useRouter } from "next/navigation";
// import { useEffect } from 'react';

import { TableItem } from "types/table-data";
import { useEffect } from "react";

interface DataTableProps<TableItem, TValue> {
  columns: ColumnDef<TableItem, TValue>[];
  data: TableItem[];
}

// ? move to type files
// export interface TableItem {
//   id: string;
//   name: string;
//   source: string;
//   created: string;
//   updated: string;
//   status: string;
//   columns: any[];
// }

export const columns: ColumnDef<TableItem>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return <TableTextWithIcon>{row.getValue("name")}</TableTextWithIcon>;
    },
  },
  {
    accessorKey: "source",
    header: "Source",
  },
  {
    accessorKey: "created",
    header: "Created",
  },
  {
    accessorKey: "updated",
    header: "Updated",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return <Badge variant="active">{row.getValue("status")}</Badge>;
    },
  },
];

export function DataTable<TableItem, TValue>({
  columns,
  data,
}: DataTableProps<TableItem, TValue>) {
  const router = useRouter();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    console.log("Table:", table.getHeaderGroups());
  }, []);

  return (
    // <div>
    <div className="rounded-md border">
      <div className="overflow-auto max-h-[calc(100vh-430px)]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="pl-8">
                      {header.isPlaceholder
                        ? undefined
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRowButton
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => {
                    console.log("Check Row:", row.original);

                    router.push(
                      window.location.pathname +
                        "/" +
                        (
                          row.original as {
                            id: string;
                          }
                        ).id
                    );
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="p-8">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRowButton>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="py-5 mx-10">
        <DataTablePagination table={table} />
      </div>
    </div>
    // </div>
  );
}
