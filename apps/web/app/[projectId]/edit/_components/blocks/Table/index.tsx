/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import type { ComponentConfig } from "@measured/puck";
import { TableRenderer, transformColumnsDef } from "./table-render";
import { useMobxStore } from "lib/mobx/store-provider";
import { ComponentsService } from "services/components.service";
import useSWR from "swr";
import { EdittedSelect } from "../Chart";
import { TableSelector } from "../../table-selector";
import { useLocalStorage } from "hooks/use-local-storage";
import { DataTable } from "./data-table";

export type TableProps = {
  title: string;
  titlePosition: "above" | "below";
  tableId: string;
  visibleColumns: string[];
  // pageSize: number;
};

export const Table: ComponentConfig<TableProps> = {
  fields: {
    title: {
      type: "text",
      label: "Title",
    },
    titlePosition: {
      type: "select",
      label: "Title Position",
      options: [
        {
          label: "Above",
          value: "above",
        },
        {
          label: "Below",
          value: "below",
        },
      ],
    },
    tableId: {
      type: "custom",
      label: "Select Table",
      render: ({ onChange, value }) => {
        return <TableSelector onChange={onChange} value={value} />;
      },
    },
    // pageSize: {
    //   type: "number",
    //   label: "Page Size",
    // },
    visibleColumns: {
      type: "custom",
      label: "View",
      render: ({ onChange, value }) => {
        return <h1>Views</h1>;
      },
    },
  },
  defaultProps: {
    title: "",
    titlePosition: "below",
    tableId: "",
    visibleColumns: [],
    // pageSize: 10,
  },
  render: ({ title, tableId, titlePosition }) => {
    const {
      projectData: { currentProjectId },
      tableData: { fetchTableData, tables },
    } = useMobxStore();
    const [yalcToken] = useLocalStorage("yalc_at", "");

    const { data, isLoading } = useSWR(
      tableId === "" ? undefined : ["tables_rows", currentProjectId, tableId],
      () =>
        fetchTableData(
          {
            tableId: tableId,
            query: {
              sql: "(1=1)",
              params: [],
            },
          },
          yalcToken
        )
    );

    if (!tableId) {
      return (
        <div className="flex w-full h-96 justify-center items-center bg-slate-100 rounded-md">
          Select a table
        </div>
      );
    }

    if (!data || isLoading) {
      return <div>Loading...</div>;
    }

    const columns = tables.find((table) => table.id === tableId)?.columns;

    return (
      <div className="container mx-auto py-10 flex items-center justify-center flex-col">
        {titlePosition === "above" && (
          <p className="mb-4 font-semibold">{title}</p>
        )}
        <DataTable columns={transformColumnsDef(columns!)} data={data.rows} />
        {titlePosition === "below" && (
          <p className="mt-4 font-semibold">{title}</p>
        )}
      </div>
    );
  },
};

// export const Table: ComponentConfig<TableProps> = {
//   fields: {
//     config: {
//       type: "custom",
//       render: ({ value, onChange }) => {
//         const {
//           projectData: { currentProjectId },
//         } = useMobxStore();

//         const componentsService = new ComponentsService();

//         const { data, isLoading } = useSWR(
//           "TABLE_DATA-${currentProjectId}-all",
//           () => componentsService.importTables({ projectId: currentProjectId })
//         );

//         if (!data || isLoading) {
//           return <div>Loading...</div>;
//         }

//         return (
//           <>
//             <EdittedSelect
//               prop="dataSourceId"
//               updateProp={onChange}
//               name="Select Table"
//               selectOptions={data.data.map((table) => table.id)}
//               configProps={value}
//             />
//           </>
//         );
//       },
//     },
//   },
//   defaultProps: {
//     config: {
//       title: "",
//       dataSourceId: "api",
//     },
//   },
//   render: ({ config }) => {
//     const {
//       projectData: { currentProjectId },
//     } = useMobxStore();

//     const componentsService = new ComponentsService();

//     const { data, isLoading } = useSWR(
//       `TABLE_DATA-${currentProjectId}-${config.dataSourceId}`,

//       () =>
//         componentsService.importTableData({
//           projectId: currentProjectId,
//           tableId: `${config.dataSourceId}`,
//         })
//     );

//     if (!data || isLoading) {
//       return <div>Loading ...</div>;
//     }

//     return (
//       <div className="container mx-auto py-10">
//         <TableRenderer
//           columns={transformColumnsDef(data.data.data.columns)}
//           data={data.data.data.rows}
//         />
//       </div>
//     );
//   },
// };

// data.data.data.columns - data.data.data.rows
