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
import { Checkbox, Label } from "@repo/ui";
import { ChevronDown } from "lucide-react";
import { TableSelectorV2 } from "../../table-selector-v2";

export type TableProps = {
  title: string;
  titlePosition: "above" | "below";
  tableConfigs: {
    tableId: string;
    selectedTableFields: any[];
    visibleColumns: string[];
  };
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
    // tableId: {
    //   type: "custom",
    //   label: "Select Table",
    //   render: ({ onChange, value }) => {
    //     return <TableSelector onChange={onChange} value={value} />;
    //   },
    // },
    tableConfigs: {
      type: "custom",
      label: "Select Table",
      render: ({ onChange, value, field }) => {
        return (
          <>
            <TableSelectorV2 onChange={onChange} value={value} />
            {value && value.selectedTableFields.length > 0 && (
              <SetVisibleColumns
                selectedTableFields={value.selectedTableFields}
                handleUpdate={onChange}
                tableConfigs={value}
              />
            )}
          </>
        );
      },
    },
  },
  defaultProps: {
    title: "",
    titlePosition: "below",
    tableConfigs: {
      tableId: "",
      selectedTableFields: [],
      visibleColumns: [],
    },
    // pageSize: 10,
  },
  render: ({ title, titlePosition, tableConfigs }) => {
    const {
      projectData: { currentProjectId },
      tableData: { fetchTableData, tables },
    } = useMobxStore();
    const [yalcToken] = useLocalStorage("yalc_at", "");

    const { data, isLoading } = useSWR(
      tableConfigs.tableId === ""
        ? undefined
        : ["tables_rows", currentProjectId, tableConfigs.tableId],
      () =>
        fetchTableData(
          {
            tableId: tableConfigs.tableId,
            query: {
              sql: "(1=1)",
              params: [],
            },
          },
          yalcToken
        )
    );

    console.log("Table Rows", data, isLoading);

    if (!tableConfigs.tableId) {
      return (
        <div className="flex w-full h-96 justify-center items-center bg-slate-100 rounded-md">
          Select a table
        </div>
      );
    }

    if (!data || isLoading) {
      return <div>Loading...</div>;
    }

    const columns = tables
      .find((table) => table.id === tableConfigs.tableId)
      ?.columns.filter((column) => {
        if (column.name === "idx") return false;
        return tableConfigs.visibleColumns.includes(column.name);
      });

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

const SetVisibleColumns = ({
  selectedTableFields,
  handleUpdate,
  tableConfigs,
}) => {
  const [visibleColumns, setVisibleColumns] = useState<any>(
    tableConfigs.visibleColumns ?? []
  );

  const onChangeVisibleColumns = (value) => {
    handleUpdate({
      ...tableConfigs,
      visibleColumns: value,
    });
  };

  return (
    <div>
      <div className="mt-2">
        <Label className="flex items-center justify-start mb-2">
          <div className="mr-1">
            <ChevronDown size={16} />
          </div>
          Choose y-Axis
        </Label>

        {selectedTableFields.map((field) => {
          if (field.name === "idx") return;

          return (
            <div
              className="flex flex-row items-start space-x-3 space-y-0"
              key={field.id}
            >
              <Checkbox
                checked={visibleColumns.includes(field.name)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setVisibleColumns([...visibleColumns, field.name]);
                    onChangeVisibleColumns([...visibleColumns, field.name]);
                  } else {
                    setVisibleColumns(
                      visibleColumns.filter((item) => item !== field.name)
                    );
                    onChangeVisibleColumns(
                      visibleColumns.filter((item) => item !== field.name)
                    );
                  }
                }}
              />
              <Label className="text-sm font-normal">{field.label}</Label>
            </div>
          );
        })}
      </div>
    </div>
  );
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
