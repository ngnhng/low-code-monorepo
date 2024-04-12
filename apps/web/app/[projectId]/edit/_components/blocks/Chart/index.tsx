import React, { useEffect, useState } from "react";
import { getClassNameFactory } from "lib";

import "chart.js/auto";
import { ChartTypeRegistry } from "chart.js/auto";
import { Chart } from "react-chartjs-2";
import styles from "./style.module.css";

import { ComponentConfig } from "@measured/puck";
import { Type, ChevronDown } from "react-feather";
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

const getClassNameInput = getClassNameFactory("Input", styles);

export type ChartsProps = {
  config: {
    // UI Chart Props
    title: string;
    chartType: ChartType;
    width: string;
    height: string;

    // Chart Data
    selectedTableFields: string[];
    tableId: string;
    unitX: string;
    datasets: any[];
    // Chart axis properties
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
    data: rowData.map((row) => row[field]),
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
    config: {
      type: "custom",
      render: ({ value, onChange }) => {
        const {
          projectData: { currentProjectId },
        } = useMobxStore();

        const componentsService = new ComponentsService();
        const [checkedArray, setCheckedArray] = useState<string[]>([]);

        const { data, isLoading } = useSWR(
          "TABLE_DATA-${currentProjectId}-all",
          () => componentsService.importTables({ projectId: currentProjectId }),
          {
            refreshInterval: REFRESH_INTERVAL_TIME,
          }
        );

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const Select = ({ prop, name, selectOptions }) => {
          return (
            <label className={getClassNameInput()}>
              <div className={getClassNameInput("label")}>
                <div className={getClassNameInput("labelIcon")}>
                  <ChevronDown size={16} />
                </div>
                {name as string}
              </div>
              <select
                className={getClassNameInput("input")}
                onChange={(e) => {
                  const clone = structuredClone(value);
                  clone[prop] = e.currentTarget.value;

                  onChange(clone);
                  console.log("Clone:", clone);
                }}
                value={value[prop]}
              >
                {selectOptions.map((option) => (
                  <option key={option} label={option} value={option} />
                ))}
              </select>
            </label>
          );
        };

        const Input = ({
          prop,
          name,
          checkCallback,
          type,
        }: {
          prop: string;
          name: string;
          type: string;
          // eslint-disable-next-line no-unused-vars
          checkCallback?: (value: string) => boolean;
        }) => {
          return (
            <label className={getClassNameInput()}>
              <div className={getClassNameInput("label")}>
                <div className={getClassNameInput("labelIcon")}>
                  <Type size={16} />
                </div>
                {name}
              </div>
              <div className="flex items-center justify-center">
                <input
                  type={type}
                  className={getClassNameInput("input")}
                  autoComplete="off"
                  onBlur={(e) => {
                    if (type === "text") {
                      const clone = structuredClone(value);
                      clone[prop] = e.currentTarget.value;

                      if (
                        !checkCallback ||
                        checkCallback(e.currentTarget.value)
                      )
                        onChange(clone);
                    }

                    if (type === "checkbox") {
                      const clone = structuredClone(value);
                      clone[prop].push(e.currentTarget.value);

                      onChange(clone);
                      console.log(value);
                    }
                  }}
                  defaultValue={type === "text" ? value[prop] : "Mock Fields"}
                />
                {type === "checkbox" ? <label>{name}</label> : undefined}
              </div>
            </label>
          );
        };

        const handleChangeChecked = (field: string) => {
          const isChecked = checkedArray.includes(field);
          const clone = structuredClone(value);

          if (isChecked) {
            setCheckedArray(checkedArray.filter((f) => f !== field));
            clone.datasets = clone.datasets.filter((f) => f !== field);
          } else {
            setCheckedArray([...checkedArray, field]);
            clone.datasets.push(field);
          }

          onChange(clone);
        };

        return (
          <div>
            <Input prop="title" name="Chart Title" type="text" />
            <Input
              prop="width"
              name="Width (css units)"
              checkCallback={cssValueCheck}
              type="text"
            />
            <Input
              prop="height"
              name="Height (css units)"
              checkCallback={cssValueCheck}
              type="text"
            />
            <EdittedSelect
              name="Chart Type"
              selectOptions={chartTypes}
              prop="chartType"
              updateProp={onChange}
              configProps={value}
            />
            {!data || isLoading ? (
              <Loading />
            ) : (
              <EdittedSelect
                prop="tableId"
                name="Select Table"
                selectOptions={data.data.map((table) => table.id)}
                updateProp={onChange}
                configProps={value}
              />
            )}
            {value.selectedTableFields.length > 0 && (
              <>
                <EdittedSelect
                  name="X Axis"
                  prop="unitX"
                  selectOptions={value.selectedTableFields}
                  configProps={value}
                  updateProp={onChange}
                />
                <div>
                  <label className={getClassNameInput()}>
                    <div className={getClassNameInput("label")}>
                      <div className={getClassNameInput("labelIcon")}>
                        <ChevronDown size={16} />
                      </div>
                      Datasets Columns
                    </div>
                    <ul>
                      {value.selectedTableFields.map((field, index) => (
                        <li
                          key={index}
                          className="space-x-2 flex items-center justify-start"
                        >
                          <Checkbox
                            id={field}
                            checked={checkedArray.includes(field)}
                            onCheckedChange={() => handleChangeChecked(field)}
                          />
                          <label htmlFor={field}>{field}</label>
                        </li>
                      ))}
                    </ul>
                  </label>
                </div>
              </>
            )}
          </div>
        );
      },
    },
  },
  defaultProps: {
    config: {
      title: "Sample Chart",
      chartType: "bar",
      width: "100%",
      height: "600px",
      tableId: "",
      unitX: "",
      selectedTableFields: [],
      datasets: [],
    },
  },
  render: ({ config }) => {
    const {
      projectData: { currentProjectId },
    } = useMobxStore();

    const componentsService = new ComponentsService();

    const { data, isLoading } = useSWR(
      config.tableId
        ? `TABLE_DATA-${currentProjectId}-${config.tableId}-rows`
        : undefined,
      () =>
        componentsService.importTableDataRows({
          projectId: currentProjectId,
          tableId: config.tableId,
        }),
      {
        refreshInterval: REFRESH_INTERVAL_TIME,
      }
    );

    useEffect(() => {
      if (!data) {
        return;
      }
      console.log("[Data]:", data);
      config.selectedTableFields = Object.keys(data.data[0]);
    }, [data, config.tableId]);

    // if (!config.selectedTableFields) {}

    if (config.tableId && (!data || isLoading)) {
      return <Loading />;
    }

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
            width: config.width,
            height: config.height,
          }}
        >
          <Chart
            type={config.chartType as keyof ChartTypeRegistry}
            data={
              transformDataset(
                data ? data.data : undefined,
                config.unitX,
                config.datasets
              )!
            }
            options={{
              maintainAspectRatio: false,
            }}
          />
        </div>
        <div
          style={{
            fontSize: "1.5rem",
          }}
        >
          {config.title}
        </div>
      </div>
    );
  },
};

const EdittedSelect = ({
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
