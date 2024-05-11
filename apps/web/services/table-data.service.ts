import {
  GetTableDataResponse,
  DataTable,
  GetTablesResponse,
  RowDef,
} from "types/table-data";
import { RouteHandlerAPIService } from "./route-handler.service";
import { TableItem } from "types/table-data";
import { mappingTypeToUI } from "app/api/dbms/_utils/utils";
export class TableDataService extends RouteHandlerAPIService {
  constructor() {
    super();
  }

  async getTableData({
    projectId,
    tableId,
    query,
    yalcToken,
  }): Promise<GetTableDataResponse> {
    const response = await this.postServerSide(
      `/api/dbms/${projectId}/${tableId}`,
      query,
      {
        headers: {
          Authorization: `Bearer ${yalcToken}`,
        },
      }
    );

    const result: GetTableDataResponse = {
      columns: response.data.columns,
      rows: response.data.rows,
      maxIndex: response.data.rows.length,
    };

    return result;
  }

  async postTableData(): Promise<DataTable> {
    const result = {
      columns: [],
      rows: [],
      pagination: {
        page: 0,
        pageSize: 0,
        totalPage: 0,
      },
      maxIndex: 0,
    };

    return result;
  }

  async getTables({ projectId, yalcToken }): Promise<GetTablesResponse[]> {
    const response = await this.getServerSide(`/api/dbms/${projectId}/all`, {
      headers: {
        Authorization: `Bearer ${yalcToken}`,
      },
    });

    const rawTables = response.data;
    const processedTables: TableItem[] = rawTables.map((table) => ({
      id: table.tid,
      name: table.name,
      label: table.label,
      source: "Source 1",
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

  async getTableRecords(projectId: string, tableId: string) {
    const response = await this.getServerSide(
      `/api/mock/${projectId}/data/${tableId}/rows`
    );

    const result: RowDef[] = response.data;

    return result;
  }
}
