import { makeObservable, observable, action, runInAction } from 'mobx';
import { RootStore } from './root';
import { ProjectService } from '../services/project.service';
import { GetProjectParams, GetProjectResponse } from '../types/project';

export interface IProjectStore {
  projectIds: string[];
  currentProjectId: string;

  // eslint-disable-next-line no-unused-vars
  fetchProject: (a0: GetProjectParams) => Promise<GetProjectResponse>;
  getCurrentProjectId: () => string;
  // eslint-disable-next-line no-unused-vars
  setCurrentProjectId: (projectId: string) => void;
}

export class ProjectStore implements IProjectStore {
  // observables
  projectIds: string[] = [];
  currentProjectId: string = '';

  // root store
  rootStore: RootStore;

  // service
  projectSerivce: ProjectService;

  constructor(_rootStore: RootStore) {
    makeObservable(this, {
      //observables
      projectIds: observable,
	  currentProjectId: observable,
      //use .ref annotation since immutability of projectData is expected.
      //see: https://mobx.js.org/observable-state.html#available-annotations
      //actions
      fetchProject: action,
	  getCurrentProjectId: action,
	  setCurrentProjectId: action,
    });

    this.rootStore = _rootStore;
    this.projectSerivce = new ProjectService();
  }

  fetchProject = async ({
    projectId,
    page,
    limit,
    search,
    sort,
    order,
    filter,
  }: GetProjectParams): Promise<GetProjectResponse> => {
    try {
      const response = await this.projectSerivce.getProject({
        projectId,
        page,
        limit,
        search,
        sort,
        order,
        filter,
      });

      if (response) {
        runInAction(() => {
          this.projectIds = response.projectIds;
        });
      }

      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  getCurrentProjectId = (): string => {
	return this.rootStore.projectData.currentProjectId;
  };

  setCurrentProjectId = (projectId: string) => {
	this.rootStore.projectData.currentProjectId = projectId;
  };
}
