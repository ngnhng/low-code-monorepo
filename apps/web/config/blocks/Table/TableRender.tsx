import {
   ColumnDef,
   ColumnHelper,
   createColumnHelper,
   flexRender,
   getCoreRowModel,
   useReactTable,
} from "@tanstack/react-table";
import { Reducer, useEffect, useMemo, useReducer } from "react";
import { DataSourceConfigProps, WebAPIDataSourceConfigProps } from ".";
import { z } from "zod";

type TableRendererProps = {
   dataSourceId: string;
   classNameFn: (options?: {}) => string;
};

type TableData = {
   columns: ColumnProps[];
   rows: RowProps[];
};

const TableDataSchema = z.object({
   columns: z.array(
      z.object({
         key: z.string(),
         label: z.string(),
         type: z.string(),
      })
   ),
   rows: z.array(z.object({})),
});

type ColumnProps = {
   key: string;
   label: string;
   type: string;
   children?: ColumnProps[];
};

type RowProps = {
   [key: string]: Record<string, unknown> | string | number | boolean;
};

type TableState = {
   loading: boolean;
   error: string | null;
   tableData: TableData | null;
};

function is<T>(value: any, type: z.ZodType<T>): value is T {
   return type.safeParse(value).success;
}

export type DataFetch = (config: any) => Promise<TableData | null>;

type FetchError = string | null;

const getAPIData = async (
   config: WebAPIDataSourceConfigProps
): Promise<TableData | null> => {
   const response = await fetch(config.url);
   if (response.ok) {
      const data = await response.json();
      if (!is<TableData>(data, TableDataSchema)) {
         throw new Error("Invalid data");
      }

      return data;
   }

   return null;
};

const createDataSource = ({
   dataSourceId,
}: {
   dataSourceId: string;
}): [DataFetch, DataSourceConfigProps, FetchError] => {
   // expected to be a call to backend API
   switch (dataSourceId) {
      case "api":
         return [getAPIData, { id: "123", url: "/api/data" }, null];

      case "api-2":
         return [getAPIData, { id: "123", url: "/api/data?e=1" }, null];

      default:
         return [() => Promise.resolve(null), {}, "No data source found"];
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

         const [dataFetch, configs, error] = createDataSource({ dataSourceId });
         const data = await dataFetch(configs);

         if (data) {
            dispatch({ type: "SUCCESS", payload: data });
         } else if (error) {
            dispatch({ type: "ERROR", payload: error });
         }
      };

      fetchTableData();
   }, [dataSourceId]);

   return state;
};

const parseColumns = (
   columnsHelper: ColumnHelper<unknown>,
   columns: ColumnProps[],
   prefix?: string
) => {
   return columns.map((column) => {
      if (column.children) {
         return columnsHelper.group({
            id: column.key,
            header: column.label,
            columns: parseColumns(
               columnsHelper,
               column.children,
               prefix ? `${prefix}.${column.key}` : column.key
            ),
         });
      }

      console.log(prefix ? `${prefix}.${column.key}` : column.key);

      return columnsHelper.accessor(
         prefix ? `${prefix}.${column.key}` : column.key,
         {
            id: column.key,
            header: column.label,
            cell: (props) => {
               return <div>{props.getValue()}</div>;
            },
         }
      );
   });
};

export function TableRenderer({
   dataSourceId,
   classNameFn,
}: TableRendererProps) {
   const { loading, error, tableData } = useTableData(dataSourceId);

   const columnHelper = useMemo(() => createColumnHelper(), []);

   const columns = useMemo(() => {
      return parseColumns(columnHelper, tableData?.columns ?? []);
   }, [tableData]);

   const rows = useMemo(() => {
      return tableData?.rows ?? [];
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
      <div className={classNameFn("renderer")}>
         <table>
            <thead>
               {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                     {headerGroup.headers.map((header) => (
                        <th key={header.id} colSpan={header.colSpan}>
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
            <tbody>
               {table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                     {row.getVisibleCells().map((cell) => (
                        <td key={cell.id}>
                           {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                           )}
                        </td>
                     ))}
                  </tr>
               ))}
            </tbody>
            {/*<tfoot>
          {table.getFooterGroups().map(footerGroup => (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map(header => (
                <th key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.footer,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </tfoot>*/}
         </table>
      </div>
   );
}
