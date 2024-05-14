import { makeObservable, observable, action, runInAction } from "mobx";
import { RootStore } from "./root";
import { ProjectService } from "../services/project.service";

export interface IProjectStore {
    projectIds: string[];
    projects: any;
    currentProjectId: string;

    viewsIds: string[];
    views: { [key: string]: any }[];
    currentView: any;

    currentViewId: string;

    getCurrentProjectId: () => string;
    setCurrentProjectId: (projectId: string) => void;
    fetchProjectList: () => any;
    getProjectById: (projectId: string) => any;
    saveView: (view: any, pid: string, viewId: string) => void;
    createView: (route: string, title: string, pid: string) => void;

    createProject: (title: string) => void;
}

export class ProjectStore implements IProjectStore {
    // observables
    projectIds: string[] = [];
    currentProjectId: string = "";
    projects: any;

    viewsIds: string[] = [];
    views: { [key: string]: any }[] = [];
    currentView: any;
    currentViewId: string = "";

    // root store
    rootStore: RootStore;

    // service
    projectSerivce: ProjectService;

    constructor(_rootStore: RootStore) {
        makeObservable(this, {
            //observables
            projectIds: observable,
            currentProjectId: observable,
            projects: observable.ref,
            viewsIds: observable,
            views: observable,
            currentView: observable,
            currentViewId: observable,
            //use .ref annotation since immutability of projectData is expected.
            //see: https://mobx.js.org/observable-state.html#available-annotations
            //actions
            getCurrentProjectId: action,
            setCurrentProjectId: action,
            fetchProjectList: action,
            getProjectById: action,
        });

        this.rootStore = _rootStore;
        this.projectSerivce = new ProjectService();
    }

    getCurrentProjectId = (): string => {
        return this.rootStore.projectData.currentProjectId;
    };

    setCurrentProjectId = (projectId: string) => {
        this.rootStore.projectData.currentProjectId = projectId;
    };

    fetchProjectList = async () => {
        try {
            const response = await this.projectSerivce.getProjectList();

            if (response) {
                runInAction(() => {
                    this.projects = response.data;
                });
            }

            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    };

    getProjectById = async (projectId: string) => {
        const data = await this.projectSerivce.getProject(projectId);
        runInAction(() => {
            this.views = data.views;
        });

        return data;
    };

    getViewByRoute = async (route: string) => {
        // search in this.views
        return this.views.find((view) => view.route === route);
    };

    saveView = async (view: any, pid: string, viewId: string) => {
        try {
            await this.projectSerivce.saveView(pid, view, viewId).then(() => {
                return true;
            });
        } catch (error) {
            console.log(error);
            throw error;
        }
    };

    createView = async (route: string, title: string, pid: string) => {
        try {
            await this.projectSerivce.createView(route, title, pid).then(() => {
                return true;
            });
        } catch (error) {
            console.log(error);
            throw error;
        }
    };

    createProject = async (title: string) => {
        try {
            await this.projectSerivce.createProject(title).then(() => {
                return true;
            });
        } catch (error) {
            console.log(error);
            throw error;
        }
    };
}
