import { GetTableDataResponse } from 'types/table-data';
import { RouteHandlerAPIService } from './route-handler.service';

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
      },
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
}
