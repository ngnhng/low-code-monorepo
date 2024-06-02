/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import cn, { getClassNameFactory } from "lib";

import "chart.js/auto";
import { ChartTypeRegistry } from "chart.js/auto";
import { Chart } from "react-chartjs-2";
import styles from "./style.module.css";

import { ComponentConfig } from "@measured/puck";
import { Type, ChevronDown, Table } from "react-feather";
import Loading from "./loading";

import { RowDef } from "types/table-data";
import { useMobxStore } from "lib/mobx/store-provider";
import { ComponentsService } from "services/components.service";
import useSWR from "swr";
import {
  Checkbox,
  Label,
  SelectContent,
  SelectItem,
  Select as SelectShadCn,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
import { TableSelector } from "../../table-selector";
import { TableSelectorV2 } from "../../table-selector-v2";
import { useLocalStorage } from "hooks/use-local-storage";

import { Colors } from "chart.js";

const getClassNameInput = getClassNameFactory("Input", styles);

export type ChartsProps = {
  title: string;
  chartType: ChartType;
  chartConfigs: {
    tableId: string;
    selectedTableFields: any[];
    xAxis: string;
    yAxis: string[];
  };
};

export type AxisProps = {
  labels: string[];
  datasets: any[];
  options?: any;
};

const chartTypes = [
  "bar",
  "line",
  "pie",
  "doughnut",
  "polarArea",
  "radar",
  "scatter",
  "bubble",
];

type ChartType = (typeof chartTypes)[number];

export const REFRESH_INTERVAL_TIME = 15_000;

const cssValueCheck = (value: string) =>
  /\d+(\.\d+)?(%|px|em|rem|(d|s|l)v(w|h))/g.test(value);

/**
Transforms the given row data into a format that can be used by charts.
  @param rowData - the data to be transformed
  @param labels - contain the value of name column labels
  @param y - the ID of the column that should be used as the y-axis
  @returns an object containing the transformed data
*/
function transformDataset(rowData: RowDef[], labels: string, y: string[]) {
  if (!rowData || !rowData[0]) {
    return {
      labels: ["Red", "Blue", "Yellow", "Green", "Purple"],
      datasets: [
        {
          label: "Sample",
          data: [7, 19, 3, 5, 2, 3],
          borderWidth: 1,
        },
        {
          label: "Sample 2",
          data: [7, 19, 3, 5, 2, 3],
          borderWidth: 1,
        },
      ],
    };
  }

  const chartDatasets = y.map((field) => ({
    label: field,
    data: rowData.map((row) => {
      if (row[field] === "true") {
        row[field] = 1;
      }

      if (row[field] === "false") {
        row[field] = 0;
      }

      return row[field];
    }),
    borderWidth: 1,
  }));

  return rowData[0][labels]
    ? {
        labels: rowData.map((row) => row[labels]),
        datasets: chartDatasets,
      }
    : {
        labels: [],
        datasets: [
          {
            label: "Choose labels and datasets",
            data: [],
            borderWidth: 1,
          },
        ],
      };
}

export const Charts: ComponentConfig<ChartsProps> = {
  fields: {
    title: {
      type: "text",
      label: "title",
    },
    chartType: {
      type: "select",
      label: "Choose chart type",
      options: chartTypes.map((type) => ({
        label: type,
        value: type,
      })),
    },
    chartConfigs: {
      type: "custom",
      render: ({ value, onChange }) => {
        return (
          <>
            <TableSelectorV2 onChange={onChange} value={value} />
            {value.selectedTableFields.length > 0 ? (
              <SetAxis
                xAxis=""
                yAxis=""
                chartConfigs={value}
                selectedTableFields={value.selectedTableFields}
                handleUpdate={onChange}
              />
            ) : undefined}
          </>
        );
      },
    },
  },
  defaultProps: {
    title: "",
    chartType: "bar",
    chartConfigs: {
      tableId: "",
      selectedTableFields: [],
      xAxis: "",
      yAxis: [],
    },
  },
  render: ({ title, chartType, chartConfigs }) => {
    const {
      tableData: { tables, fetchTableData },
      projectData: { currentProjectId },
    } = useMobxStore();
    const [yalcToken] = useLocalStorage("yalc_at", "");

    console.log("CHART_CONFIG", chartConfigs);

    const { data, isLoading } = useSWR(
      chartConfigs.tableId === ""
        ? undefined
        : ["tables_rows", currentProjectId, chartConfigs.tableId],
      () =>
        fetchTableData(
          {
            tableId: chartConfigs.tableId,
            query: {
              sql: "(1=1)",
              params: [],
            },
          },
          yalcToken
        )
    );

    if (!chartConfigs.tableId) {
      return (
        <div className="flex w-full h-96 justify-center items-center bg-slate-100 rounded-md">
          Select a table
        </div>
      );
    }

    if (!data || isLoading) {
      return (
        <div className="flex w-full h-96 justify-center items-center bg-slate-100 rounded-md">
          Loading ...
        </div>
      );
    }

    console.log("data: " + data.rows);

    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "20px",
          padding: "20px",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            height: "450px",
            width: "100%",
          }}
        >
          <Chart
            type={chartType as keyof ChartTypeRegistry}
            data={
              transformDataset(
                data ? data.rows : undefined,
                chartConfigs.xAxis,
                chartConfigs.yAxis
              )!
            }
            options={{
              maintainAspectRatio: false,
            }}
          />
        </div>
        <p className="font-semibold">{title}</p>
      </div>
    );
  },
};

const SetAxis = ({
  selectedTableFields,
  xAxis,
  yAxis,
  handleUpdate,
  chartConfigs,
}: {
  selectedTableFields: any[];
  xAxis: string;
  yAxis: string;
  handleUpdate: any;
  chartConfigs: any;
}) => {
  const onChangeXAxis = (value) => {
    handleUpdate({
      ...chartConfigs,
      xAxis: value,
    });
  };

  const onChangeYAxis = (value) => {
    handleUpdate({
      ...chartConfigs,
      yAxis: value,
    });
  };

  const [yAxisValues, setYAxisvalues] = useState<string[]>([]);

  return (
    <div>
      <div className={cn(getClassNameInput(), "mt-2")}>
        <Label className="flex items-center justify-start mb-2">
          <div className="mr-1">
            <ChevronDown size={16} />
          </div>
          Choose x-Axis
        </Label>

        <SelectShadCn
          onValueChange={(value) => onChangeXAxis(value)}
          defaultValue={xAxis ?? undefined}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a column for x-axis" />
          </SelectTrigger>
          <SelectContent>
            {selectedTableFields.map((table) => (
              <SelectItem value={table.name} key={table.id}>
                {table.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectShadCn>
      </div>

      <div className="mt-2">
        <Label className="flex items-center justify-start mb-2">
          <div className="mr-1">
            <ChevronDown size={16} />
          </div>
          Choose y-Axis
        </Label>

        {selectedTableFields.map((field) => (
          <div
            className="flex flex-row items-start space-x-3 space-y-0"
            key={field.id}
          >
            <Checkbox
              checked={yAxisValues.includes(field.name)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setYAxisvalues([...yAxisValues, field.name]);
                  onChangeYAxis([...yAxisValues, field.name]);
                } else {
                  setYAxisvalues(
                    yAxisValues.filter((item) => item !== field.name)
                  );
                  onChangeYAxis(
                    yAxisValues.filter((item) => item !== field.name)
                  );
                }
              }}
            />
            <Label className="text-sm font-normal">{field.label}</Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export const EdittedSelect = ({
  name,
  selectOptions,
  prop,
  updateProp,
  configProps,
}: {
  name: string;
  selectOptions: any[];
  prop: string;
  updateProp: any;
  configProps: any;
}) => {
  return (
    <label className={getClassNameInput()}>
      <Label className="flex items-center justify-start mb-2">
        <div className="mr-1">
          <ChevronDown size={16} />
        </div>
        {name}
      </Label>
      <SelectShadCn
        onValueChange={(v) => {
          const clone = structuredClone(configProps);
          clone[prop] = v;

          // resolve for only tableId change -> must reset datasets and x-axis
          if (prop === "tableId") {
            clone.datasets = [];
            clone.unitX = "";
          }

          updateProp(clone);
          console.log("Clone:", clone);
        }}
        // defaultValue={defaultValue === "" ? "" : defaultValue}
      >
        <SelectTrigger>
          <SelectValue placeholder={`Select ${name}`} />
        </SelectTrigger>
        <SelectContent>
          {selectOptions.map((option, index) => (
            <SelectItem key={index} value={option}>
              {option.toUpperCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectShadCn>
    </label>
  );
};
