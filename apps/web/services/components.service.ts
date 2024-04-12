import { RouteHandlerAPIService } from "./route-handler.service";

export class ComponentsService extends RouteHandlerAPIService {
  constructor() {
    super();
  }

  async importTables({ projectId }) {
    const response = await this.getServerSide(
      `/api/mock/${projectId}/data/all`
    );

    return response;
  }

  async importTableData({ projectId, tableId }) {
    const response = await this.getServerSide(
      `/api/mock/${projectId}/data/${tableId}`
    );

    return response;
  }

  async importTableDataRows({ projectId, tableId }) {
    const response = await this.getServerSide(
      `/api/mock/${projectId}/data/${tableId}/rows`
    );

    return response;
  }
}
