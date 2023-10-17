import {
   createColumnHelper,
   flexRender,
   getCoreRowModel,
   useReactTable,
} from "@tanstack/react-table";
import { Reducer, useEffect, useReducer, useState } from "react";
import { DataSourceConfigProps, WebAPIDataSourceConfigProps } from ".";

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

export type DataFetch = (config: any) => Promise<TableData | null>;

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

const getAPIData = async (
   config: WebAPIDataSourceConfigProps
): Promise<TableData | null> => {
   const response = await fetch(config.url);
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
}): [DataFetch, DataSourceConfigProps] => {
   // expected to be a call to backend API
   switch (dataSourceId) {
      case "api":
         return [getAPIData, { id: "123", url: "/api/data" }];
      default:
         return [getStaticData, { id: "123", type: "static", data: [] }];
   }
};

type Action =
   | { type: "LOADING" }
   | { type: "SUCCESS"; payload: TableData }
   | { type: "ERROR"; payload: string };

const tableReducer: Reducer<TableState, Action> = (state, action) => {
   switch (action.type) {
      case "LOADING":
         return { ...state, loading: true, error: null };
      case "SUCCESS":
         return { ...state, loading: false, tableData: action.payload };
      case "ERROR":
         return { ...state, loading: false, error: action.payload };
      default:
         throw new Error();
   }
};

const useTableData = (dataSourceId: string) => {
   const [state, dispatch] = useReducer(tableReducer, {
      loading: false,
      error: null,
      tableData: null,
   });

   useEffect(() => {
      const fetchTableData = async () => {
         dispatch({ type: "LOADING" });

         const [dataFetch, configs] = createDataSource({ dataSourceId });
         const data = await dataFetch(configs);

         if (data) {
            dispatch({ type: "SUCCESS", payload: data });
         } else {
            dispatch({ type: "ERROR", payload: "No data available" });
         }
      };

      fetchTableData();
   }, [dataSourceId]);

   return state;
};

export function TableRenderer({
   dataSourceId,
   classNameFn,
}: TableRendererProps) {
   const { loading, error, tableData } = useTableData(dataSourceId);

   const columnHelper = createColumnHelper();

   const columns = (tableData?.columns || []).map((column) =>
      columnHelper.accessor(column.key, {
         header: column.label,
         cell: (info) => info.getValue(),
      })
   );

   const table = useReactTable({
      columns,
      data: tableData?.rows || [],
      getCoreRowModel: getCoreRowModel(),
   });

   if (loading) {
      return <div>Loading...</div>;
   }

   if (error) {
      return <div>{error}</div>;
   }

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
