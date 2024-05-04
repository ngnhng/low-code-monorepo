/* eslint-disable no-unused-vars */
"use client";

import useSWR from "swr";

import "react-datasheet-grid/dist/style.css";

import { useMobxStore } from "lib/mobx/store-provider";
import { ColumnDef, DataTable, RowDef } from "types/table-data";
import { TableEditor } from "../_components/view/table-editor";

import { toast } from "sonner";
import axios from "axios";

export default function Page({
  params,
}: {
  params: {
    tableId: string;
    projectId: string;
  };
}) {
  const {
    tableData: { fetchTableData, fetchAppliedQueries },
  } = useMobxStore();

  const { data, isLoading, mutate } = useSWR<DataTable>(
    `TABLE_DATA-${params.projectId}-${params.tableId}`,
    () =>
      fetchTableData({
        tableId: params.tableId,
        ...fetchAppliedQueries(params.tableId),
      })
  );

  if (!data || isLoading) {
    return <div>Loading...</div>;
  }

  const handleCommit = async (
    localColumns: ColumnDef[],
    localData: RowDef[],
    addedRowIds: Set<number>,
    deletedRowIds: Set<number>,
    updatedRowIds: Set<number>,
    createdColumns: Set<ColumnDef>,
    newReferenceTable
  ) => {
    const filteredData =
      deletedRowIds.size > 0
        ? localData.filter((row) => !deletedRowIds.has(row.id))
        : localData;

    try {
      await axios.put(`/api/mock/${params.projectId}/data/${params.tableId}`, {
        data: {
          columns: localColumns,
          rows: filteredData,
        },
        newReferenceTableIds: newReferenceTable,
      });

      const changeLogs = {
        addedRows: addedRowIds,
        deletedRows: deletedRowIds,
        updatedRows: updatedRowIds,
        addedColumns: createdColumns,
      };

      const submitData = {
        ...processEditLogData(filteredData, changeLogs),
        newReferenceTable,
      };

      console.log("[SUBMIT_DATA]:", submitData);

      toast.success(
        `Table has been updated at: /api/mock/${params.projectId}/data/${params.tableId} `,
        {
          description: (
            <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
              <code className="text-white">
                {JSON.stringify(newReferenceTable, undefined, 2)}
              </code>
            </pre>
          ),
        }
      );
      mutate();
    } catch (error) {
      console.error("Something went wrong when committing", error);
    }

    console.log("handleCommit");
  };

  return (
    <div className="mx-4 h-full">
      <TableEditor
        tableId={params.tableId}
        tableData={data}
        onCommit={handleCommit}
      />
    </div>
  );
}

type editLogType = {
  addedRows: Set<number>;
  deletedRows: Set<number>;
  updatedRows: Set<number>;
  addedColumns: Set<ColumnDef>;
};

type finalEditLogType = {
  addedRows: {
    [key: string]: any;
  }[];
  updatedRows: {
    id: string;
    values: {
      [key: string]: any;
    };
  }[];
  deletedRows: number[];
  addedColumns: any;
};

function processEditLogData(
  localData: RowDef[],
  editLog: editLogType
): finalEditLogType {
  const addedRows = localData
    .filter((row) => editLog.addedRows.has(row.id))
    .map((row) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...rest } = row;
      return rest;
    });
  const updatedRows = localData
    .filter((row) => editLog.updatedRows.has(row.id))
    .map((row) => {
      const { id, ...rest } = row;
      return {
        id: id.toString(),
        values: rest,
      };
    });
  const deletedRows = [...editLog.deletedRows];
  const addedColumns = [...editLog.addedColumns].map((column) => {
    const { label, type } = column;

    return {
      name: label,
      type: type,
    };
  });

  return {
    addedRows: addedRows,
    updatedRows: updatedRows,
    deletedRows: deletedRows,
    addedColumns: addedColumns,
  };
}
