import styles from './style.module.css';

import React, { useEffect, useState } from 'react';
import { ComponentConfig } from '@measured/puck';
import getClassNameFactory from 'lib/classname-factory/get-classname-factory';
import { Type, ChevronDown } from 'react-feather';

import 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import { ChartTypeRegistry } from 'chart.js/auto';
import axios, { CancelTokenSource } from 'axios';
import Loading from './loading';
import { RowDef } from 'types/table-data';

const getClassNameInput = getClassNameFactory('Input', styles);

export type ChartsProps = {
  config: {
    url: string;
    title: string;
    chartType: string;
    width: string;
    height: string;
    // ----
    visibleColumns: string[];
    importType: 'provider' | 'database' | '';
    tableId: string;
    // ---
    labels: string;
    datasets: any[];
    selectedTableFields: any[];
  };
};

export type DataFormat = {
  labels: string[];
  datasets: any[];
  options?: any;
};

const chartTypes = [
  'bar',
  'line',
  'pie',
  'doughnut',
  'polarArea',
  'radar',
  'scatter',
  'bubble',
];

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
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple'],
      datasets: [
        {
          label: 'Sample',
          data: [7, 19, 3, 5, 2, 3],
          borderWidth: 1,
        },
        {
          label: 'Sample 2',
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
            label: 'Choose labels and datasets',
            data: [],
            borderWidth: 1,
          },
        ],
      };
}

// function generateLabels(data) {
//   return data.map();
// }

// function generateDatasets() {}

const cssValueCheck = (value: string) =>
  /\d+(\.\d+)?(%|px|em|rem|(d|s|l)v(w|h))/g.test(value);

const importTypes = ['provider', 'database'];

export const Charts: ComponentConfig<ChartsProps> = {
  fields: {
    config: {
      type: 'custom',
      render: ({ value, onChange }) => {
        // eslint-disable-next-line no-unused-vars
        const [chartData, setChartData] = useState<any[]>();
        // eslint-disable-next-line no-unused-vars
        const [isLoading, setIsLoading] = useState(false);
        const [importType, setImportType] = useState<string>('provider');
        const [checkedArray, setCheckedArray] = useState<string[]>([]);

        const fetchChartData = async (source: CancelTokenSource) => {
          setIsLoading(true);

          try {
            const response = await axios.get(value.url, {
              cancelToken: source.token,
            });

            const data = response.data;

            setIsLoading(false);
            setChartData(data);
          } catch (error) {
            console.log(error);
          }
        };

        useEffect(() => {
          if (value.importType === '' || value.importType === 'provider')
            return;

          if (value.url === '') return;

          const source = axios.CancelToken.source();
          fetchChartData(source);

          return () => {
            source.cancel();
          };
        }, [value.url]);

        const Select = ({ prop, name, selectOptions }) => {
          return (
            <label className={getClassNameInput()}>
              <div className={getClassNameInput('label')}>
                <div className={getClassNameInput('labelIcon')}>
                  <ChevronDown size={16} />
                </div>
                {name as string}
              </div>
              <select
                className={getClassNameInput('input')}
                onChange={(e) => {
                  const clone = structuredClone(value);
                  clone[prop] = e.currentTarget.value;

                  onChange(clone);
                  console.log('Clone:', clone);
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
              <div className={getClassNameInput('label')}>
                <div className={getClassNameInput('labelIcon')}>
                  <Type size={16} />
                </div>
                {name}
              </div>
              <div className="flex items-center justify-center">
                <input
                  type={type}
                  className={getClassNameInput('input')}
                  autoComplete="off"
                  onBlur={(e) => {
                    if (type === 'text') {
                      const clone = structuredClone(value);
                      clone[prop] = e.currentTarget.value;

                      if (
                        !checkCallback ||
                        checkCallback(e.currentTarget.value)
                      )
                        onChange(clone);
                    }

                    if (type === 'checkbox') {
                      const clone = structuredClone(value);
                      clone[prop].push(e.currentTarget.value);

                      onChange(clone);
                      console.log(value);
                    }
                  }}
                  defaultValue={type === 'text' ? value[prop] : 'Mock Fields'}
                />
                {type === 'checkbox' ? <label>{name}</label> : undefined}
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
            <Input prop="title" name="Title" type="text" />
            <Select
              prop="chartType"
              name="Chart Type"
              selectOptions={chartTypes}
            />
            <div>
              <label className={getClassNameInput()}>
                <div className={getClassNameInput('label')}>
                  <div className={getClassNameInput('labelIcon')}>
                    <ChevronDown size={16} />
                  </div>
                  Import Type
                </div>
                <select
                  className={getClassNameInput('input')}
                  onChange={(e) => {
                    setChartData(undefined);
                    setImportType(e.currentTarget.value);
                    const clone = structuredClone(value);
                    clone.importType = e.currentTarget.value;
                    clone.url = '';
                    clone.selectedTableFields = [];
                    clone.labels = '';
                    clone.datasets = [];

                    if (e.currentTarget.value === 'database') {
                      clone.url = `http://localhost:3000/api/mock/trollface/data/all`;
                    }

                    onChange(clone);
                  }}
                  value={importType}
                >
                  {importTypes.map((type) => (
                    <option key={type} label={type} value={type} />
                  ))}
                </select>
              </label>
            </div>
            <Input
              prop="width"
              name="Width (in %, px, em, etc)"
              checkCallback={cssValueCheck}
              type="text"
            />
            <Input
              prop="height"
              name="Height (in %, px, em, etc)"
              checkCallback={cssValueCheck}
              type="text"
            />
            {importType === 'provider' ? (
              <Input prop="url" name="Data source URL" type="text" />
            ) : // eslint-disable-next-line unicorn/no-nested-ternary
            chartData ? (
              <Select
                name="Choose Table"
                prop="tableId"
                selectOptions={chartData.map((table) => table.id)}
              />
            ) : (
              <Loading />
            )}
            {value.selectedTableFields.length > 0 && (
              <>
                <Select
                  name="Choose Label Columns"
                  prop="labels"
                  selectOptions={value.selectedTableFields}
                />

                <div>
                  <p>Choose Datasets Columns</p>
                  <ul>
                    {value.selectedTableFields.map((field, index) => (
                      <li key={index}>
                        <input
                          type="checkbox"
                          id={field}
                          checked={checkedArray.includes(field)}
                          onChange={() => handleChangeChecked(field)}
                        />
                        <label htmlFor={field}>{field}</label>
                      </li>
                    ))}
                  </ul>
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
      url: '',
      title: 'Sample Chart',
      chartType: 'bar',
      width: '100%',
      height: '600px',
      visibleColumns: [],
      importType: 'provider',
      tableId: '',
      labels: '',
      datasets: [],
      selectedTableFields: [],
    },
  },
  render: ({ config }) => {
    // eslint-disable-next-line no-unused-vars
    const [chartData, setChartData] = useState<RowDef[]>();
    // eslint-disable-next-line no-unused-vars
    const [isLoading, setIsLoading] = useState(false);

    const fetchChartData = async (source: CancelTokenSource) => {
      console.log('Fetching chart data ...');
      const urlToFetch =
        config.importType === 'database'
          ? `http://localhost:3000/api/mock/trollface/data/${config.tableId}/rows`
          : config.url;

      setIsLoading(true);

      try {
        const response = await axios.get(urlToFetch, {
          cancelToken: source.token,
        });

        const data = response.data;

        console.log('chart data', data);

        setIsLoading(false);
        setChartData(data);
        config.selectedTableFields = Object.keys(data[0]);
        // config.labels = config.selectedTableFields[0];
      } catch (error) {
        console.log(error);
      }
    };

    useEffect(() => {
      if (config.importType === '') return;

      if (config.importType === 'database' && config.tableId === '') return;

      if (config.url === '') return;

      const source = axios.CancelToken.source();
      fetchChartData(source);

      return () => {
        source.cancel();
      };
    }, [config.url, config.tableId]);

    return isLoading ? (
      <Loading />
    ) : (
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '20px',
          padding: '20px',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            width: config.width,
            height: config.height,
          }}
        >
          <Chart
            type={config.chartType as keyof ChartTypeRegistry}
            // data={{
            //   labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple'],
            //   datasets: [
            //     {
            //       label: '# of Votes',
            //       data: ['ae', 19, 3, 5, 2, 3],
            //       borderWidth: 1,
            //     },
            //   ],
            // }}
            data={transformDataset(chartData!, config.labels, config.datasets)!}
            options={{
              maintainAspectRatio: false,
            }}
          />
        </div>
        <div
          style={{
            fontSize: '1.5rem',
          }}
        >
          {config.title}
        </div>
      </div>
    );
  },
};
