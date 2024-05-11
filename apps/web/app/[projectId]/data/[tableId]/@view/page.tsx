/* eslint-disable no-unused-vars */
"use client";

import useSWR from "swr";
import { useLocalStorage } from "hooks/use-local-storage";

import "react-datasheet-grid/dist/style.css";

import { useMobxStore } from "lib/mobx/store-provider";
import { ColumnDef, ColumnType, RowDef } from "types/table-data";
import { TableEditor } from "../_components/view/table-editor";

import { toast } from "sonner";
// import axios from "axios";
// import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatValidUiDate } from "app/api/dbms/_utils/utils";

export default function Page({
  params,
}: {
  params: {
    tableId: string;
    projectId: string;
  };
}) {
  const {
    tableData: { fetchTableData, fetchTableColumns },
  } = useMobxStore();

  const [yalcToken] = useLocalStorage("yalc_at", "");
  const [isSubmiting, setIsSubmiting] = useState(false);
  // const router = useRouter();

  const queryObject = {
    sql: "(1=1)",
    params: [],
  };

  // const tableRecords = fetchTableData(
  //   {
  //     tableId: params.tableId,
  //     query: { queryObject },
  //   },
  //   yalcToken
  // );

  // const tableColumns = fetchTableColumn(yalcToken, params.tableId);

  // const [tableRecordsData, tableColumnsData] = await Promise.all([
  //   tableRecords,
  //   tableColumns,
  // ]);

  const {
    data: tableRecordsData,
    isLoading: tableRecordsLoading,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mutate: tableRecordsMutate,
  } = useSWR(`TABLE_DATA-${params.projectId}-${params.tableId}`, () =>
    fetchTableData(
      {
        tableId: params.tableId,
        query: queryObject,
      },
      yalcToken
    )
  );

  const {
    data: tableColumnsData,
    isLoading: tableColumnsLoading,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mutate: tableColumnsMutate,
  } = useSWR(`TABLE_COLUMMS-${params.projectId}-${params.tableId}`, () =>
    fetchTableColumns(yalcToken, params.tableId)
  );

  if (
    !tableColumnsData ||
    !tableRecordsData ||
    tableRecordsLoading ||
    tableColumnsLoading
  ) {
    return <div>Loading...</div>;
  }

  // console.log("RAW_RECORDS", tableRecordsData.rows);
  // console.log(
  //   "MODIED_RECORDS",
  //   mappingValueDate(tableColumnsData.columns, tableRecordsData.rows)
  // );
  // console.log("COLUMNS", tableColumnsData);

  const handleCommit = async (
    localColumns: ColumnDef[],
    localData: RowDef[],
    addedRowIds: Set<number>,
    deletedRowIds: Set<number>,
    updatedRowIds: Set<number>,
    createdColumns: Set<ColumnDef>,
    newReferenceTable
  ) => {
    setIsSubmiting(true);

    const filteredData =
      deletedRowIds.size > 0
        ? localData.filter((row) => !deletedRowIds.has(row.id))
        : localData;

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

    // const configs = {
    //   headers: {
    //     Authorization: `Bearer ${yalcToken}`,
    //   },
    // };
    try {
      // if (submitData.addedRows.length > 0) {
      //   await axios.post(
      //     `/api/dbms/${params.projectId}/${params.tableId}/rows`,
      //     {
      //       rows: submitData.addedRows,
      //     },
      //     configs
      //   );
      // }

      // if (submitData.updatedRows.length > 0) {
      //   await axios.patch(
      //     `/api/dbms/${params.projectId}/${params.tableId}/rows`,
      //     submitData.updatedRows,
      //     configs
      //   );
      // }

      // if (submitData.deletedRows.length > 0) {
      //   await axios.delete(
      //     `/api/dbms/${params.projectId}/${params.tableId}/rows`,
      //     {
      //       headers: {
      //         Authorization: `Bearer ${yalcToken}`,
      //       },
      //       data: {
      //         ids: submitData.deletedRows,
      //       },
      //     }
      //   );
      // }

      // if (submitData.addedColumns.length > 0) {
      //   await axios.post(
      //     `/api/dbms/${params.projectId}/${params.tableId}/columns`,
      //     {
      //       columns: submitData.addedColumns,
      //     },
      //     configs
      //   );
      // }

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

      setIsSubmiting(false);
      // router.refresh();
    } catch (error) {
      console.error("Something went wrong when committing", error);
    }

    console.log("handleCommit");
  };

  return (
    // <div>Hello Page</div>
    <div className="mx-4 h-full">
      <TableEditor
        tableId={params.tableId}
        tableData={{
          rows: mappingValueDate(
            tableColumnsData.columns,
            tableRecordsData.rows
          ),
          columns: tableColumnsData.columns,
          maxIndex: tableRecordsData.maxIndex,
        }}
        onCommit={handleCommit}
        yalcToken={yalcToken}
        isSubmitting={isSubmiting}
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
      console.log("ROW:", row);
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
        values: convertedObjValues(rest),
      };
    });
  const deletedRows = [...editLog.deletedRows];
  const addedColumns = [...editLog.addedColumns].map((column) => {
    const { label, type } = column;

    return {
      name: label,
      type: mappingType(type),
    };
  });

  return {
    addedRows: convertedActionLogsValues(addedRows),
    updatedRows: updatedRows,
    deletedRows: deletedRows,
    addedColumns: addedColumns,
  };
}

function convertedObjValues(obj) {
  for (const key in obj) {
    if (obj[key] === undefined || obj[key] === null) {
      continue;
    } else {
      obj[key] = obj[key].toString();
    }
  }
  return obj;
}

function convertedActionLogsValues(actionLogs) {
  const convertedActionLogs = actionLogs.map((obj) => {
    const newObj = {};
    for (const key in obj) {
      newObj[key] = obj[key].toString();
    }
    return newObj;
  });

  return convertedActionLogs;
}

function mappingType(type: ColumnType) {
  switch (type) {
    case "text": {
      return "string";
    }
    case "number": {
      return "integer";
    }
    case "boolean": {
      return "boolean";
    }
    case "date": {
      return "date";
    }
    case "link": {
      return "  ";
    }
    default: {
      return "string";
    }
  }
}

function mappingValueDate(columns, rows) {
  for (const row of rows) {
    const fields = Object.keys(row);
    for (const field of fields) {
      const matchingColumn = columns.find((column) => column.name === field);

      if (matchingColumn && matchingColumn.type === "date") {
        row[field] = formatValidUiDate(row[field]);
      }
    }
  }

  return rows;
}
