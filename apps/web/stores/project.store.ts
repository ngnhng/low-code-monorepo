import {
    makeObservable,
    observable,
    action,
    runInAction,
    computed,
    toJS,
} from "mobx";
import { RootStore } from "./root";
import { ProjectService } from "../services/project.service";
import { IntegrationService } from "../services/integration.service";

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
    createDatabase: (pid: string) => void;

    currentProjectName: () => string;

    updateViewComponentWorkflowId: (route, componentId, workflowId) => void;

    fetchSheets: (pid: string) => void;
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
    integrationService: IntegrationService;

    constructor(_rootStore: RootStore) {
        makeObservable(this, {
            //observables
            projectIds: observable,
            currentProjectId: observable,
            projects: observable.ref,
            viewsIds: observable,
            views: observable.ref,
            currentView: observable,
            currentViewId: observable,
            //use .ref annotation since immutability of projectData is expected.
            //see: https://mobx.js.org/observable-state.html#available-annotations
            //actions
            getCurrentProjectId: action,
            setCurrentProjectId: action,
            fetchProjectList: action,
            getProjectById: action,
            // computed
            currentProjectName: computed,
        });

        this.rootStore = _rootStore;
        this.projectSerivce = new ProjectService();
        this.integrationService = new IntegrationService();
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
        console.log("Get Project Data:", data);
        runInAction(() => {
            this.views = data?.views;
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
            return await this.projectSerivce
                .createProject(title)
                .then((res) => {
                    console.log("Create Project Store Response:", res);
                    return res;
                });
        } catch (error) {
            console.log(error);
            throw error;
        }
    };

    createDatabase = async (pid: string) => {
        try {
            await this.projectSerivce.createDatabase(pid).then(() => {
                return true;
            });
        } catch (error) {
            console.log(error);
            throw error;
        }
    };

    get currentProjectName() {
        if (!this.projects || !this.currentProjectId) {
            return "";
        }
        return this.projects.find(
            (project) => project.pid === this.currentProjectId
        )?.title;
    }

    updateViewComponentWorkflowId = async (
        route: string,
        componentId: string,
        workflowId: string
    ) => {
        // find the view by route and update the component workflowId
        console.log("Update View Component Workflow ID:", route, componentId);

        const view = this.views.find((view) => view.uiData?.route === route);
        if (!view) {
            throw new Error("View not found");
        }

        const updatedView = toJS(view);

        console.log("View:", updatedView);

        const contentComponent = updatedView.uiData?.content?.find(
            (component) => {
                console.log("Component:", component);
                return component?.props.id === componentId;
            }
        );

        const zonesComponent = Object.values(
            updatedView.uiData?.zones || {}
        ).flatMap((zone: any) =>
            zone.filter((component) => component?.props.id === componentId)
        );

        console.log("Content Component:", contentComponent);
        console.log("Zones Component:", zonesComponent);

        if (contentComponent || zonesComponent) {
            if (contentComponent) {
                contentComponent.props.workflowId = workflowId;
            } else if (zonesComponent && zonesComponent[0].props) {
                zonesComponent[0].props.workflowId = workflowId;
            }

            console.log("TEST", view, this.currentProjectId, updatedView);
            try {
                return await this.saveView(
                    updatedView.uiData,
                    this.currentProjectId,
                    updatedView.id
                ).then(() => {
                    return true;
                });
            } catch (error) {
                console.log(error);
                throw error;
            }
        }

        throw new Error("Component not found");
    };

    fetchSheets = async (
        pid: string
    ): Promise<{
        spreadsheets: {
            id: string;
            name: string;
            worksheets: {
                id: string;
                name: string;
                rows: string[];
            }[];
        }[];
    }> => {
        try {
            const response = await this.integrationService.fetchSheets(pid);

            // Ensure the response data has the correct shape
            if (!response.data || !response.data.spreadsheets) {
                throw new Error("Invalid response data");
            }

            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    };
}
