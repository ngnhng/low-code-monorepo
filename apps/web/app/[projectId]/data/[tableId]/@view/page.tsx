"use client";

import useSWR from "swr";
import { useLocalStorage } from "hooks/use-local-storage";

import "react-datasheet-grid/dist/style.css";

import { useMobxStore } from "lib/mobx/store-provider";
import { ColumnDef, RowDef } from "types/table-data";
import { TableEditor } from "../_components/view/table-editor";

import { toast } from "sonner";
import axios from "axios";
// import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    // formatValidUiDate,
    mappingType,
    mappingValueDate,
} from "app/api/dbms/_utils/utils";

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
        sql: ` ( 1 = 1 ) `,
        params: [],
    };

    const {
        data: tableRecordsData,
        isLoading: tableRecordsLoading,
        mutate: tableRecordsMutate,
    } = useSWR(
        ["tables_rows", params.projectId, params.tableId],
        () =>
            fetchTableData(
                {
                    tableId: params.tableId,
                    query: queryObject,
                },
                yalcToken
            ),
        {
            revalidateIfStale: false,
            revalidateOnFocus: false,
        }
    );

    const {
        data: tableColumnsData,
        isLoading: tableColumnsLoading,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        mutate: tableColumnsMutate,
    } = useSWR(
        `TABLE_COLUMMS-${params.projectId}-${params.tableId}`,
        () => fetchTableColumns(yalcToken, params.tableId),
        {
            revalidateIfStale: false,
            revalidateOnFocus: false,
        }
    );

    if (
        !tableColumnsData ||
        !tableRecordsData ||
        tableRecordsLoading ||
        tableColumnsLoading
    ) {
        return <div>Loading...</div>;
    }

    const handleCommit = async (
        localColumns: ColumnDef[],
        localData: RowDef[],
        addedRowIds: Set<number>,
        deletedRowIds: Set<number>,
        updatedRowIds: Set<number>,
        createdColumns: Set<ColumnDef>
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
            ...processEditLogData(filteredData, changeLogs, localColumns),
        };

        const configs = {
            headers: {
                Authorization: `Bearer ${yalcToken}`,
            },
        };

        const promises: any = [];

        try {
            if (submitData.addedRows.length > 0) {
                promises.push(addRows(submitData.addedRows, configs));
            }

            if (submitData.updatedRows.length > 0) {
                promises.push(updateRows(submitData.updatedRows, configs));
            }

            if (submitData.deletedRows.length > 0) {
                promises.push(deleteRows(submitData.deletedRows, configs));
            }

            if (promises.length > 0) {
                const results = await Promise.allSettled(promises);
                for (const [index, result] of results.entries()) {
                    if (result.status === "rejected") {
                        console.error(
                            `Promise ${index + 1} failed with ${result.reason}`
                        );
                    }
                    console.log("Promise", index + 1, "done");
                }
                console.log("Refresh Data");
                tableRecordsMutate();
                tableColumnsMutate();
            }

            toast.success(`Success Updated`);
        } catch (error) {
            console.error("Something went wrong when committing", error);
        } finally {
            setIsSubmiting(false);
        }
    };

    const addRows = (rows, configs) => {
        return axios.post(
            `/api/dbms/${params.projectId}/${params.tableId}/rows`,
            { rows },
            configs
        );
    };

    const updateRows = (rows, configs) => {
        return axios.patch(
            `/api/dbms/${params.projectId}/${params.tableId}/rows`,
            { data: rows },
            configs
        );
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const deleteRows = (rows, configs) => {
        return axios.delete(
            `/api/dbms/${params.projectId}/${params.tableId}/rows`,
            {
                headers: {
                    Authorization: `Bearer ${yalcToken}`,
                },
                data: {
                    ids: rows,
                },
            }
        );
    };

    const onSuccessCreateColumn = async () => {
        await Promise.all([tableRecordsMutate(), tableColumnsMutate()]);
    };

    console.log(
        "AFTER_MAPPING:",
        mappingValueDate(tableColumnsData.columns, tableRecordsData.rows)
    );

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
                onSuccessCreateColumn={onSuccessCreateColumn}
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
        [key: string]: any;
    }[];
    deletedRows: number[];
    addedColumns: any;
};

function processEditLogData(
    localData: RowDef[],
    editLog: editLogType,
    localColumns
): finalEditLogType {
    const addedRows = localData
        .filter((row) => editLog.addedRows.has(row.id))
        .map((row) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...rest } = convertedObjValues(row, localColumns);

            return rest;
        });

    const updatedRows = localData
        .filter((row) => editLog.updatedRows.has(row.id))
        .map((row) => {
            const { id, ...rest } = row;
            return {
                id: id.toString(),
                ...convertedObjValues(rest, localColumns),
            };
        });
    const deletedRows = [...editLog.deletedRows];
    const addedColumns = [...editLog.addedColumns].map((column) => {
        const { label, type, referenceTable } = column;

        return {
            label: label,
            type: mappingType(type),
            reference: referenceTable
                ? {
                      table_id: referenceTable,
                  }
                : undefined,
        };
    });

    return {
        addedRows: addedRows,
        updatedRows: updatedRows,
        deletedRows: deletedRows,
        addedColumns: addedColumns,
    };
}

function convertedObjValues(obj, localColumns) {
    for (const key in obj) {
        if (obj[key] === undefined || obj[key] === null) {
            continue;
        }

        // eslint-disable-next-line unicorn/prefer-ternary
        if (
            localColumns.some(
                (column) => column.name === key && column.type === "link"
            )
        ) {
            obj[key] = `[${obj[key].children_ids.toString()}]`;
        } else {
            obj[key] = obj[key].toString();
        }
    }
    return obj;
}

// function convertedActionLogsValues(actionLogs) {
//   const convertedActionLogs = actionLogs.map((obj) => {
//     const newObj = {};
//     for (const key in obj) {
//       newObj[key] = obj[key].toString();
//     }
//     return newObj;
//   });

//   return convertedActionLogs;
// }
