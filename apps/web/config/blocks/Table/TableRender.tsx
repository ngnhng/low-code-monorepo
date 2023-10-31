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
} from "@tanstack/react-table";
import { rankItem, compareItems } from "@tanstack/match-sorter-utils";

import { Reducer, useEffect, useMemo, useReducer, useState } from "react";
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
            id: prefix ? `${prefix}.${column.key}` : column.key,
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
            id: prefix ? `${prefix}.${column.key}` : column.key,
            header: column.label,
            cell: (props) => {
               return <div>{props.getValue()}</div>;
            },
         }
      );
   });
};

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
   // Rank the item
   const itemRank = rankItem(row.getValue(columnId), value);

   // Store the itemRank info
   addMeta({
      itemRank,
   });

   // Return if the item should be filtered in/out
   return itemRank.passed;
};
const fuzzySort = (rowA, rowB, columnId) => {
   let dir = 0;

   // Only sort by rank if the column has ranking information
   if (rowA.columnFiltersMeta[columnId]) {
      dir = compareItems(
         rowA.columnFiltersMeta[columnId]!,
         rowB.columnFiltersMeta[columnId]!
      );
   }

   // Provide an alphanumeric fallback for when the item ranks are equal
   return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
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

   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
   const [globalFilter, setGlobalFilter] = useState("");

   const table = useReactTable({
      columns,
      data: rows,
      filterFns: {
         fuzzy: fuzzyFilter,
      },
      state: {
         columnFilters,
         globalFilter,
      },
      onColumnFiltersChange: setColumnFilters,
      onGlobalFilterChange: setGlobalFilter,
      globalFilterFn: fuzzyFilter,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFacetedRowModel: getFacetedRowModel(),
      getFacetedUniqueValues: getFacetedUniqueValues(),
      getFacetedMinMaxValues: getFacetedMinMaxValues(),
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
                        <>
                           <th
                              key={header.id}
                              colSpan={header.colSpan}
                              className={classNameFn("th")}
                           >
                              {header.isPlaceholder ? null : (
                                 <>
                                    <div
                                       {...{
                                          className: header.column.getCanSort()
                                             ? "cursor-pointer select-none"
                                             : "",
                                          onClick:
                                             header.column.getToggleSortingHandler(),
                                       }}
                                    >
                                       {flexRender(
                                          header.column.columnDef.header,
                                          header.getContext()
                                       )}
                                       {{
                                          asc: " 🔼",
                                          desc: " 🔽",
                                       }[
                                          header.column.getIsSorted() as string
                                       ] ?? null}
                                    </div>
                                    {header.column.getCanFilter() ? (
                                       <div>
                                          <Filter
                                             column={header.column}
                                             table={table}
                                          />
                                       </div>
                                    ) : null}
                                 </>
                              )}
                           </th>
                        </>
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

function TableController({
   table,
   classNameFn,
}: {
   table: Table<RowProps>;
   classNameFn: any;
}) {
   return (
      <div className={classNameFn("pagination")}>
         <div className={classNameFn("pagination-btns")}>
            <button
               onClick={() => table.setPageIndex(0)}
               disabled={!table.getCanPreviousPage()}
            >
               {"<<"}
            </button>
            <button
               onClick={() => table.previousPage()}
               disabled={!table.getCanPreviousPage()}
            >
               {"<"}
            </button>
            <button
               onClick={() => table.nextPage()}
               disabled={!table.getCanNextPage()}
            >
               {">"}
            </button>
            <button
               onClick={() => table.setPageIndex(table.getPageCount() - 1)}
               disabled={!table.getCanNextPage()}
            >
               {">>"}
            </button>
         </div>
         <div className={classNameFn("pagination-pages")}>
            <span>
               Page {table.getState().pagination.pageIndex + 1} of{" "}
               {table.getPageCount()}
            </span>
            <span>
               | Go to page:
               <input
                  type="number"
                  defaultValue={table.getState().pagination.pageIndex + 1}
                  onChange={(e) => {
                     const page = e.target.value
                        ? Number(e.target.value) - 1
                        : 0;
                     table.setPageIndex(page);
                  }}
               />
            </span>
            <select
               value={table.getState().pagination.pageSize}
               onChange={(e) => {
                  table.setPageSize(Number(e.target.value));
               }}
            >
               {[2, 4, 6, 8, 10, 20, 30, 40, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                     Show {pageSize}
                  </option>
               ))}
            </select>
         </div>
         {/*<div>{table.getRowModel().rows.length} Rows</div>*/}
      </div>
   );
}

function Filter({
   column,
   table,
}: {
   column: Column<any, unknown>;
   table: Table<any>;
}) {
   const firstValue = table
      .getPreFilteredRowModel()
      .flatRows[0]?.getValue(column.id);

   const columnFilterValue = column.getFilterValue();

   const sortedUniqueValues = useMemo(
      () =>
         typeof firstValue === "number"
            ? []
            : Array.from(column.getFacetedUniqueValues().keys()).sort(),
      [column.getFacetedUniqueValues()]
   );

   return typeof firstValue === "number" ? (
      <div>
         <div className="flex space-x-2">
            <DebouncedInput
               type="number"
               min={Number(column.getFacetedMinMaxValues()?.[0] ?? "")}
               max={Number(column.getFacetedMinMaxValues()?.[1] ?? "")}
               value={(columnFilterValue as [number, number])?.[0] ?? ""}
               onChange={(value) =>
                  column.setFilterValue((old: [number, number]) => [
                     value,
                     old?.[1],
                  ])
               }
               placeholder={`Min ${
                  column.getFacetedMinMaxValues()?.[0]
                     ? `(${column.getFacetedMinMaxValues()?.[0]})`
                     : ""
               }`}
               className="w-24 border shadow rounded"
            />
            <DebouncedInput
               type="number"
               min={Number(column.getFacetedMinMaxValues()?.[0] ?? "")}
               max={Number(column.getFacetedMinMaxValues()?.[1] ?? "")}
               value={(columnFilterValue as [number, number])?.[1] ?? ""}
               onChange={(value) =>
                  column.setFilterValue((old: [number, number]) => [
                     old?.[0],
                     value,
                  ])
               }
               placeholder={`Max ${
                  column.getFacetedMinMaxValues()?.[1]
                     ? `(${column.getFacetedMinMaxValues()?.[1]})`
                     : ""
               }`}
               className="w-24 border shadow rounded"
            />
         </div>
         <div className="h-1" />
      </div>
   ) : (
      <>
         <datalist id={column.id + "list"}>
            {sortedUniqueValues.slice(0, 5000).map((value: any) => (
               <option value={value} key={value} />
            ))}
         </datalist>
         <DebouncedInput
            type="text"
            value={(columnFilterValue ?? "") as string}
            onChange={(value) => column.setFilterValue(value)}
            placeholder={`Search... (${column.getFacetedUniqueValues().size})`}
            className="w-36 border shadow rounded"
            list={column.id + "list"}
         />
         <div className="h-1" />
      </>
   );
}

function DebouncedInput({
   value: initialValue,
   onChange,
   debounce = 500,
   ...props
}: {
   value: string | number;
   onChange: (value: string | number) => void;
   debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
   const [value, setValue] = useState(initialValue);

   useEffect(() => {
      setValue(initialValue);
   }, [initialValue]);

   useEffect(() => {
      const timeout = setTimeout(() => {
         onChange(value);
      }, debounce);

      return () => clearTimeout(timeout);
   }, [value]);

   return (
      <input
         {...props}
         value={value}
         onChange={(e) => setValue(e.target.value)}
      />
   );
}
