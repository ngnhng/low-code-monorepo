/* eslint-disable no-unused-vars */
"use client";

import useSWR from "swr";

import "react-datasheet-grid/dist/style.css";

import { useMobxStore } from "lib/mobx/store-provider";
import { ColumnDef, DataTable, RowDef } from "types/table-data";
import { TableEditor } from "../_components/view/table-editor";

// import { toast } from "sonner";
// import axios from "axios";

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
      // await axios.put(`/api/mock/${params.projectId}/data/${params.tableId}`, {
      //   data: {
      //     columns: localColumns,
      //     rows: filteredData,
      //   },
      //   newReferenceTableIds: newReferenceTable,
      // });

      const changeLogs = {
        addedRows: addedRowIds,
        deletedRows: deletedRowIds,
        updatedRows: updatedRowIds,
        addedColumns: createdColumns,
      };

      const submitData = {
        data: {
          columns: localColumns,
          rows: filteredData,
        },
        newReferenceTableIds: newReferenceTable,
        changeLogs: changeLogs,
      };

      console.log("[SUBMIT_DATA]:", submitData);

      // toast.success(
      //   `Table has been updated at: /api/mock/${params.projectId}/data/${params.tableId} `,
      //   {
      //     description: (
      //       <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
      //         <code className="text-white">
      //           {JSON.stringify(newReferenceTable, undefined, 2)}
      //         </code>
      //       </pre>
      //     ),
      //   }
      // );
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
