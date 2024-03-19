/* eslint-disable no-unused-vars */
"use client";

import useSWR from "swr";

import "react-datasheet-grid/dist/style.css";

import { useMobxStore } from "lib/mobx/store-provider";
import { ColumnDef, DataTable, RowDef } from "types/table-data";
import { TableEditor } from "../_components/view/table-editor";

import { toast } from "sonner";
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

  const handleCommit = (
    localColumns: ColumnDef[],
    localData: RowDef[],
    deletedRowIds: Set<number>,
    newReferenceTable
    // eslint-disable-next-line unicorn/consistent-function-scoping
  ) => {
    if (deletedRowIds.size > 0) {
      localData = localData.filter((row) => !deletedRowIds.has(row.id));
    }

    try {
      // axios.put(`/api/mock/${params.projectId}/data/${params.tableId}`, {
      //   data: {
      //     columns: localColumns,
      //     rows: localData,
      //   },
      // });

      console.log(localData);

      toast.success(
        `Table has been updated at: /api/mock/${params.projectId}/data/${params.tableId} `,
        {
          description: (
            <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
              <code className="text-white">
                {JSON.stringify(
                  {
                    data: {
                      columns: localColumns,
                      rows: localData,
                    },
                  },
                  undefined,
                  2
                )}
              </code>
            </pre>
          ),
        }
      );
    } catch {
      console.error("Something went wrong when committing");
    }

    console.log("handleCommit");
  };

  return (
    <>
      <TableEditor
        tableId={params.tableId}
        tableData={data}
        onCommit={handleCommit}
      />
    </>
  );
}
