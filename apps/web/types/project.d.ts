
export interface GetProjectParams {
  projectId: string;
  page: number;
  limit: number;
  search: string;
  sort: string;
  order: string;
  filter: string;
}

export interface GetProjectResponse extends ProjectData {}

interface ProjectData {
  projectIds: string[];
  pagination: {
	page: number;
	pageSize: number;
	totalPage: number;
  };
}
