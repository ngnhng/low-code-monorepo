"use client";

import {
  checkboxColumn,
  Column,
  textColumn,
  keyColumn,
  intColumn,
  dateColumn,
  DynamicDataSheetGrid,
  AddRowsComponentProps,
} from "react-datasheet-grid";

// Import the style only once in your app!
import "react-datasheet-grid/dist/style.css";
import { Operation } from "react-datasheet-grid/dist/types";
import useSWR from "swr";
import { useMobxStore } from "lib/mobx/store-provider";
import { ColumnType, DataTable, RowDef } from "types/table-data";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@repo/ui";

export default function Page({ params: { tableId } }) {
  const {
    tableData: { fetchTableData, fetchAppliedQueries },
    projectData: { currentProjectId },
  } = useMobxStore();

  const { data, isLoading, error, mutate } = useSWR<DataTable>(
    `TABLE_DATA-${currentProjectId}-${tableId}`,
    () =>
      fetchTableData({
        tableId,
        ...fetchAppliedQueries(tableId),
      })
  );

  const handleCommit = () => {
    console.log("committing data", data);
  };

  const handleQuery = (query: any) => {
    console.log("query", query);
  };

  if (!data || isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <TableEditor
        tableId={tableId}
        data={data}
        onCommit={handleCommit}
        onQuery={handleQuery}
      />
    </>
  );
}

const TableEditor = ({
  tableId,
  data,
  onCommit,
  onQuery,
}: {
  tableId: string;
  data: DataTable;
  onCommit: any;
  onQuery: any;
}) => {
  const [localData, setLocalData] = useState<RowDef[]>(data.rows);
  const [localColumns, setLocalColumns] = useState(data.columns);
  const [maxIndex, setMaxIndex] = useState(data.maxIndex);
  const [fields, setFields] = useState<Column[]>([]);

  const createdRowIds = useMemo(() => new Set<number>(), [tableId]);
  const deletedRowIds = useMemo(() => new Set<number>(), [tableId]);
  const updatedRowIds = useMemo(() => new Set<number>(), [tableId]);

  const createdColumn = useMemo(() => new Set<string>(), [tableId]);
  const deletedColumn = useMemo(() => new Set<string>(), [tableId]);

  useEffect(() => {
    const columns = localColumns.map((column) =>
      column.id === "id"
        ? {
            ...keyColumn<RowDef>(column.id, colTypeMapper(column.type)),
            title: column.label,
            disabled: true,
          }
        : {
            ...keyColumn<RowDef>(column.id, colTypeMapper(column.type)),
            title: column.label,
          }
    );

    setFields(columns);
  }, [localColumns]);

  const handleChange = (value: RowDef[], ops: Operation[]) => {
    for (const op of ops) {
      switch (op.type) {
        case "CREATE": {
          for (const row of value.slice(op.fromRowIndex, op.toRowIndex)) {
            createdRowIds.add(row.id);
          }

          break;
        }

        case "UPDATE": {
          for (const row of value.slice(op.fromRowIndex, op.toRowIndex)) {
            if (!createdRowIds.has(row.id) && !deletedRowIds.has(row.id)) {
              updatedRowIds.add(row.id);
            }
          }

          break;
        }

        case "DELETE": {
          for (const [, { id }] of localData
            .slice(op.fromRowIndex, op.toRowIndex)
            .entries()) {
            updatedRowIds.delete(id);
            if (createdRowIds.has(id)) {
              createdRowIds.delete(id);
            }

            deletedRowIds.add(id);
          }

          // re-add the deleted rows
          value.splice(
            op.fromRowIndex,
            op.toRowIndex - op.fromRowIndex,
            ...localData.slice(op.fromRowIndex, op.toRowIndex + 1)
          );

          break;
        }
      }

      console.log(
        "OP:",
        op.type,
        "VAL:",
        value.slice(op.fromRowIndex, op.toRowIndex + 1),
        "Created:",
        createdRowIds,
        "Deleted:",
        deletedRowIds,
        "Updated:",
        updatedRowIds
      );
    }

    setLocalData(value);
  };

  //  const addNewColumn = () => {
  //	const newCol = keyColumn('newCol', textColumn, title: 'New Column');

  //    createdColumn.add(newCol.id);
  //    setLocalColumns([...localColumns, newCol]);
  //  };

  const genId = () => {
    const newMax = maxIndex + 1;
    setMaxIndex(newMax);
    return newMax;
  };

  const discardData = () => {
    setLocalData(data.rows);
    setLocalColumns(data.columns);
  };

  return (
    <>
      <ViewMenubar
        onCommit={onCommit}
        discardData={discardData}
        onAddNewColumn={() => {}}
        onQuery={onQuery}
      />

      <DynamicDataSheetGrid
        value={localData}
        onChange={handleChange}
        columns={fields}
        height={700}
        rowKey="id"
        createRow={() => {
          return {
            ...Object.fromEntries(localColumns.map((col) => [col.id, ""])),
            id: genId(),
          };
        }}
        duplicateRow={({ rowData }) => {
          return {
            ...rowData,
            id: genId(),
          };
        }}
        rowClassName={({ rowData }) => {
          if (deletedRowIds.has(rowData.id)) {
            return "row-deleted";
          }
          if (createdRowIds.has(rowData.id)) {
            return "row-created";
          }
          if (updatedRowIds.has(rowData.id)) {
            return "row-updated";
          }
        }}
        cellClassName={({ rowData, rowIndex, columnId }) => {
          if (createdColumn.has(columnId || "")) {
            return "cell-created";
          }
          if (deletedColumn.has(columnId || "")) {
            return "cell-deleted";
          }
        }}
        //gutterColumn={{ component: ({ rowData }) => <div>{rowData.id}</div> }}
        gutterColumn={false}
        addRowsComponent={(props) => <AddRows {...props} table={data} />}
      />
    </>
  );
};

function AddRows({
  addRows,
  table,
}: AddRowsComponentProps & { table: DataTable }) {
  return <button onClick={() => addRows(10)}>Add 10 rows</button>;
}

const colTypeMapper = (type: ColumnType) => {
  switch (type) {
    case "text": {
      return textColumn;
    }
    case "number": {
      return intColumn;
    }
    case "boolean": {
      return checkboxColumn;
    }
    case "date": {
      return dateColumn;
    }
    default: {
      return textColumn;
    }
  }
};

const ViewMenubar = ({
  onCommit,
  discardData,
  onAddNewColumn,
  onQuery,
}: {
  onCommit: any;
  discardData: any;
  onAddNewColumn: any;
  onQuery: any;
}) => (
  <div className="flex justify-between w-full px-4">
    <div className="flex flex-start space-x-4">
      <Button onClick={onCommit}>Commit</Button>
      <Button onClick={discardData}>Discard</Button>
    </div>
    <div className="flex flex-start">
      <Button onClick={onAddNewColumn}>Add New Column</Button>
    </div>
    <div className="flex flex-end space-x-4">
      <Button onClick={onQuery}>Group By</Button>
      <Button onClick={onQuery}>Filter</Button>
      <Button onClick={onQuery}>Sort</Button>
    </div>
  </div>
);
