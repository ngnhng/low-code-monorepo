import React from "react";
import type { ComponentConfig } from "@measured/puck";
import { TableRenderer, transformColumnsDef } from "./table-render";
import { useMobxStore } from "lib/mobx/store-provider";
import { ComponentsService } from "services/components.service";
import useSWR from "swr";
import { EdittedSelect } from "../Chart";

export type TableProps = {
  config: {
    title?: string;
    dataSourceId: string;
  };
};

export const Table: ComponentConfig<TableProps> = {
  fields: {
    config: {
      type: "custom",
      render: ({ value, onChange }) => {
        const {
          projectData: { currentProjectId },
        } = useMobxStore();

        const componentsService = new ComponentsService();

        const { data, isLoading } = useSWR(
          "TABLE_DATA-${currentProjectId}-all",
          () => componentsService.importTables({ projectId: currentProjectId })
        );

        if (!data || isLoading) {
          return <div>Loading...</div>;
        }

        return (
          <>
            <EdittedSelect
              prop="dataSourceId"
              updateProp={onChange}
              name="Select Table"
              selectOptions={data.data.map((table) => table.id)}
              configProps={value}
            />
          </>
        );
      },
    },
  },
  defaultProps: {
    config: {
      title: "",
      dataSourceId: "api",
    },
  },
  render: ({ config }) => {
    const {
      projectData: { currentProjectId },
    } = useMobxStore();

    const componentsService = new ComponentsService();

    const { data, isLoading } = useSWR(
      `TABLE_DATA-${currentProjectId}-${config.dataSourceId}`,

      () =>
        componentsService.importTableData({
          projectId: currentProjectId,
          tableId: `${config.dataSourceId}`,
        })
    );

    if (!data || isLoading) {
      return <div>Loading ...</div>;
    }

    return (
      <div className="container mx-auto py-10">
        <TableRenderer
          columns={transformColumnsDef(data.data.data.columns)}
          data={data.data.data.rows}
        />
      </div>
    );
  },
};

// data.data.data.columns - data.data.data.rows
