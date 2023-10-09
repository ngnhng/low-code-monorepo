import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { Column } from ".";

interface TableRendererProps {
    columns: Column[];
    data?: object;
    classNameFn: (options?: {}) => string;
}

export function TableRenderer({
    columns,
    data,
    classNameFn,
}: TableRendererProps) {
    const [tableData, setTableData] = useState(data);
    const columnHelper = createColumnHelper();

    const cols = columns.map((column) => {
        const col = columnHelper.accessor(column.key, {
            header: column.label,
            cell: (row: any) => {
                return flexRender(column.type, {
                    value: row.value,
                    row,
                });
            },
        });
        return col;
    });

    const table = useReactTable({
        columns: cols,
        data: [],
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div>
            <table className={classNameFn()}>
                <thead className={classNameFn("head")}>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext()
                                          )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className={classNameFn("body")}>
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id} className={classNameFn("row")}>
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} className={classNameFn("cell")}>
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
