/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    ColumnDef,
    // GetTableDataResponse,
    DataTable,
    GetTablesResponse,
    RowDef,
} from "types/table-data";
import { RouteHandlerAPIService } from "./route-handler.service";
import { TableItem } from "types/table-data";
import { mappingTypeToUI } from "app/api/dbms/_utils/utils";
import { CLIENT_BASE_URL } from "helpers/common.helper";
export class TableDataService extends RouteHandlerAPIService {
    constructor() {
        super(CLIENT_BASE_URL);
    }

    async getTableColumns({ projectId, tableId, yalcToken }) {
        const response = await this.get(`/api/dbms/${projectId}/${tableId}`);

        const modifiedColumns: ColumnDef[] = response.data.columns.map(
            (column) => ({
                id: column.id,
                label: column.label,
                name: column.name,
                type: mappingTypeToUI(column.type),
                referenceTable: column.reference?.table_id,
                isActive: true,
                isPrimaryKey: false,
                isForeignKey: false,
            })
        );

        return {
            ...response.data,
            columns: modifiedColumns,
        };
    }

    async getTableData({ projectId, tableId, query, yalcToken }) {
        const response = await this.post(
            `/api/dbms/${projectId}/${tableId}`,
            query
        );
        const result = {
            rows: response.data.data,
            maxIndex:
                response.data.data.length === 0
                    ? 0
                    : // eslint-disable-next-line unicorn/no-array-reduce
                      response.data.data.reduce((prev, curr) =>
                          prev ? (prev.id > curr.id ? prev : curr) : curr
                      ).id,
        };

        return result;
    }

    async getTables({ projectId }): Promise<GetTablesResponse[]> {
        console.log("Fetching tables", projectId);
        const response = await this.get(`/api/dbms/${projectId}/all`);

        const rawTables = response.data;
        const processedTables: TableItem[] = rawTables.map((table) => ({
            id: table.tid,
            name: table.name,
            label: table.label,
            source: "Platform's Hosted DB",
            created: table.createdAt ?? "2024-01-01",
            updated: table.updatedAt ?? "2024-01-01",
            status: "Active",
            columns: table.columns.map((column) => ({
                ...column,
                type: mappingTypeToUI(column.type),
                label: column.label,
                name: column.name,
            })),
        }));

        return processedTables;
    }

    async getTableRelations({ projectId, tableId }) {
        const response = await this.getServerSide(
            `/api/mock/${projectId}/data/${tableId}/relations`
        );

        const result: TableItem[] = response.data;

        return result;
    }

    async getRelationalTable({ projectId, tableId }) {
        try {
            const response = await this.get(
                `/api/dbms/${projectId}/${tableId}`
            );

            const referenceTableIds = response.data.columns
                .filter((column) => column.type === "link")
                .map((column) => column.reference.table_id);

            return referenceTableIds;
        } catch (error) {
            console.log("REALTIONAL_ERROR:", error);
        }
    }

    async insertRow({
        projectId,
        tableId,
        data,
    }: {
        projectId: string;
        tableId: string;
        data: { rows: Record<string, string>[] };
    }) {
        const response = await this.post(
            `/api/dbms/${projectId}/${tableId}/rows`,
            data
        );

        return response.data;
    }
}
