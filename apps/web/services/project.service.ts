import { GetProjectParams, GetProjectResponse } from '../types/project';
import { RouteHandlerAPIService } from './route-handler.service';

export class ProjectService extends RouteHandlerAPIService {
  constructor() {
    super();
  }

  async getProject({
    projectId,
    page,
    limit,
    search,
    sort,
    order,
    filter,
  }: GetProjectParams): Promise<GetProjectResponse> {
    const response = await this.getServerSide(`/api/mock/${projectId}`, {
      params: {
        page,
        limit,
        search,
        sort,
        order,
        filter,
      },
    });

    const result: GetProjectResponse = {
      projectIds: response.data.data.projectIds,
      pagination: {
        page: response.data.meta.page,
        pageSize: response.data.meta.pageSize,
        totalPage: response.data.meta.totalPage,
      },
    };

    return result;
  }
}
