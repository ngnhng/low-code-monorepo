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
import { TextWithIcon } from "../../../../../components/text/text-with-icon";
import { useRouter } from "next/navigation";

import { useEffect } from "react";
import { Workflow } from "lucide-react";

export type WorkflowListAttributes = {
    name: string;
    created: string;
    updated: string;
    status: string;
};

export type WorkflowItem = { id: string } & WorkflowListAttributes;

interface DataTableProps<WorkflowItem, TValue> {
    columns: ColumnDef<WorkflowItem, TValue>[];
    data: WorkflowItem[];
}

export const columns: ColumnDef<WorkflowItem>[] = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
            return (
                <TextWithIcon icon={<Workflow size={24} />}>
                    {row.getValue("name")}
                </TextWithIcon>
            );
        },
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

export function WorkflowTable<WorkflowItem, TValue>({
    columns,
    data,
}: DataTableProps<WorkflowItem, TValue>) {
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
        <div className="overflow-auto">
            <div className="rounded-md border">
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
                                                      header.column.columnDef
                                                          .header,
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
                                    data-state={
                                        row.getIsSelected() && "selected"
                                    }
                                    onClick={() => {
                                        router.push(
                                            window.location.pathname +
                                                "/" +
                                                (row.original as { id: string })
                                                    .id
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
                <div className="py-5 mx-10">
                    <DataTablePagination table={table} />
                </div>
            </div>
        </div>
    );
}
