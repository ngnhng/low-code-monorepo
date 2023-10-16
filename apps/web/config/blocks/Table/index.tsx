import React from "react";
import { Adaptor, ComponentConfig } from "@measured/puck/types/Config";
import styles from "./styles.module.css";
import { getClassNameFactory } from "@measured/puck/lib";
import { TableRenderer } from "./TableRender";
import { Section } from "../../components/Section";

const getClassName = getClassNameFactory("Table", styles);

export type WebAPIDataSourceConfigProps = {
  id: string;
  url: string;
  apiKey?: string;
};

export type DataSourceConfigProps =
  | WebAPIDataSourceConfigProps
  | { id: string; type: "static"; data: object[] };

export type TableProps = {
  title: string;
  dataSourceId: string;
};

export const Table: ComponentConfig<TableProps> = {
  fields: {
    title: { type: "text" },
    dataSourceId: { type: "text" },
  },
  render: ({ title, dataSourceId }: TableProps) => {
    return (
      <Section className={getClassName()}>
        <div className={getClassName("renderer")}>
          <TableRenderer
            dataSourceId={dataSourceId}
            classNameFn={getClassName}
          />
        </div>
      </Section>
    );
  },
};
