import {
   ColumnDef,
   createColumnHelper,
   flexRender,
   getCoreRowModel,
   useReactTable,
} from "@tanstack/react-table";
import { parse } from "path";
import { Reducer, useEffect, useMemo, useReducer, useState } from "react";
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
   children?: ColumnProps[];
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

function sanitize(rawJSON: object[]): TableData {
   const columns = Object.keys(rawJSON[0]).map((key) => ({
      key,
      label: key,
      type: "text",
   }));

   const rows = rawJSON.map((row) => {
      const newRow: RowProps = {};
      columns.forEach((column) => {
         newRow[column.key] = row[column.key];
      });
      return newRow;
   });

   return { columns, rows };
}

function isDataFormatValid(data: any): data is TableData {
   if (!data) {
      return false;
   }

   if (!Array.isArray(data.columns) || !Array.isArray(data.rows)) {
      return false;
   }

   return true;
}

const flattenObject = (obj: Record<string, any>, prefix = "") => {
   return Object.keys(obj).reduce((acc, key) => {
      const pre = prefix.length ? prefix + "_" : "";
      if (
         typeof obj[key] === "object" &&
         obj[key] !== null &&
         !Array.isArray(obj[key])
      ) {
         Object.assign(acc, flattenObject(obj[key], pre + key));
      } else {
         acc[pre + key] = obj[key];
      }
      return acc;
   }, {});
};

const flattenArray = (arr: any[] | undefined) => {
   if (!arr) {
      return [];
   }
   return arr.map((item) => {
      if (typeof item === "object" && item !== null && !Array.isArray(item)) {
         return flattenObject(item);
      }
      return item;
   });
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
      if (!isDataFormatValid(data)) {
         return sanitize(data);
      }
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

      case "api-2":
         return [getAPIData, { id: "123", url: "/api/data?e=1" }];
      case "url-1":
         return [
            getAPIData,
            { id: "123", url: "https://jsonplaceholder.typicode.com/users" },
         ];
      case "url-2":
         return [
            getAPIData,
            { id: "123", url: "https://jsonplaceholder.typicode.com/posts" },
         ];
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

   const columnHelper = useMemo(() => createColumnHelper(), []);

   const parseColumns = (columns, parentKey?: string) => {
      return columns.map((column) => {
         if (column.children) {
            return {
               ...column,
               header: column.label,
               columns: parseColumns(column.children, column.key),
            };
         }

         if (parentKey)
            return columnHelper.accessor(`${parentKey}_${column.key}`, {
               header: column.label,
               cell: (info) => info.getValue(),
            });

         return columnHelper.accessor(column.key, {
            header: column.label,
            cell: (info) => info.getValue(),
         });
      });
   };

   const columns = useMemo(() => {
      return parseColumns(tableData?.columns || []);
   }, [tableData]);

   const rows = useMemo(() => {
      return flattenArray(structuredClone(tableData?.rows));
   }, [tableData]);

   const table = useReactTable({
      columns,
      data: rows,
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
