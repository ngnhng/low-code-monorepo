import {
   createColumnHelper,
   flexRender,
   getCoreRowModel,
   useReactTable,
} from "@tanstack/react-table";
import { Reducer, useEffect, useState } from "react";

type TableRendererProps = {
   dataSourceId: string;
   classNameFn: (options?: {}) => string;
};

type TableData = {
   columns: ColumnProps[];
   rows: RowProps[];
};

type ColumnProps = {
   key: string;
   label: string;
   type: string;
};

type RowProps = {
   [key: string]: any;
};

type StaticConfig = {
   type: "static";
   path: "/api/data";
};

type TableState = {
   loading: boolean;
   error: string | null;
   tableData: TableData | null;
};

export type DataFetch = (config?: any) => Promise<TableData | null>;

const getStaticData = async (
   config: StaticConfig
): Promise<TableData | null> => {
   const response = await fetch(config.path);
   if (response.ok) {
      const data = await response.json();
      return data;
   }

   return null;
};

const createDataSource = ({
   dataSourceId,
}: {
   dataSourceId: string;
}): DataFetch => {
   switch (dataSourceId) {
      case "static":
         return getStaticData;
   }

   return () => Promise.resolve(null);
};

export function TableRenderer({
   dataSourceId,
   classNameFn,
}: TableRendererProps) {
   const [state, setState] = useState<TableState>({
      loading: false,
      error: null,
      tableData: null,
   });
   const columnHelper = createColumnHelper();

   const fetchTableData = async () => {
      if (!dataSourceId) {
         setState({ ...state, error: "No data source ID provided" });
         return;
      }

      setState({ ...state, loading: true, error: null });

      const dataFetch = createDataSource({ dataSourceId });
      const data = await dataFetch();

      setState({ ...state, loading: false, tableData: data });

      if (!data) {
         setState({ ...state, error: "No data available" });
      }
   };

   useEffect(() => {
      fetchTableData();
   }, []);

   const columns = state.tableData!.columns.map((column) =>
      columnHelper.accessor(column.key, {
         header: column.label,
         cell: (info) => info.getValue(),
      })
   );

   const table = useReactTable({
      columns,
      data: state.tableData!.rows,
      getCoreRowModel: getCoreRowModel(),
   });

   return (
      <div>
         <table className={classNameFn("table")}>
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
