import {
  GetTableDataResponse,
  DataTable,
  GetTablesResponse,
  RowDef,
} from "types/table-data";
import { RouteHandlerAPIService } from "./route-handler.service";
import { TableItem } from "types/table-data";
export class TableDataService extends RouteHandlerAPIService {
  constructor() {
    super();
  }

  async getTableData({
    projectId,
    tableId,
    page,
    limit,
    query,
  }): Promise<GetTableDataResponse> {
    const response = await this.getServerSide(
      `/api/mock/${projectId}/data/${tableId}`,
      {
        params: {
          page,
          limit,
          query,
        },
      }
    );

    const result: GetTableDataResponse = {
      columns: response.data.data.columns,
      rows: response.data.data.rows,
      pagination: {
        page: response.data.meta.page,
        pageSize: response.data.meta.pageSize,
        totalPage: response.data.meta.totalPage,
      },
      maxIndex: response.data.data.maxIndex,
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

  async getTables({ projectId }): Promise<GetTablesResponse[]> {
    const response = await this.getServerSide(
      `/api/mock/${projectId}/data/all`
    );

    const result: TableItem[] = response.data;

    return result;
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
