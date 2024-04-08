"use client";

import {
    makeObservable,
    observable,
    action,
    computed,
    runInAction,
} from "mobx";
import { RootStore } from "./root";
import { BpmnWorkflowService } from "services/bpmn-workflow.service";
import defaultXml from "../app/[projectId]/workflow/default-xml";

export interface IWorkflowStore {
    newRenderer: (options?: any) => Promise<any> | any;
    //  setRenderer: (renderer: any) => void;

    currentWorkflow: any;
    modeler: any;
    activeElement: any;

    currentExecutingWorkflowId: string;
    currentExecutingElementId: string;
    currentExecutingStatus: string;

    setCurrentWorkflow: (workflow: any) => void;
    setModeler: (modeler: any) => void;
    getModeler: () => any;
    setActiveElement: (element: any) => void;

    launchWorkflow: () => Promise<[string, boolean]>;
    fetchWorkflow: (workflowId: string) => Promise<any>;

    workflowId: string;
}

export class WorkflowStore {
    //observables
    currentWorkflow: any;
    modeler: any;
    activeElement: any;

    currentExecutingWorkflowId = "";
    currentExecutingElementId = "";
    currentExecutingStatus = "";

    // root store
    rootStore: RootStore;

    //service
    workflowService: BpmnWorkflowService;

    constructor(_rootStore: RootStore) {
        makeObservable(this, {
            //observable
            currentWorkflow: observable,
            modeler: observable.ref,
            activeElement: observable.ref,
            // js strings are immutable, so we can use observable instead of observable.ref
            currentExecutingWorkflowId: observable,
            currentExecutingElementId: observable,
            currentExecutingStatus: observable,
            //action
            //  setRenderer: action,
            setCurrentWorkflow: action,
            setModeler: action,
            //  fetchWorkflow: action,
            //  fetchWorkflowList: action,
            //computed
            workflowId: computed,
        });

        this.rootStore = _rootStore;
        this.currentWorkflow = undefined;
        // eslint-disable-next-line unicorn/no-null
        this.modeler = null;
        this.workflowService = new BpmnWorkflowService();
    }

    newRenderer = async (options?: any) => {
        const m = await this.workflowService.renderer(options);
        runInAction(() => {
            this.modeler = m;
        });
        return m;
    };

    //  setRenderer = async (renderer: any) => {
    //    this.renderer = await this.workflowService.renderer();
    //  };

    setCurrentWorkflow = (workflow: any) => {
        this.currentWorkflow = workflow;
    };

    setModeler = (modeler: any) => {
        this.modeler = modeler;
    };

    getModeler = () => {
        return this.modeler;
    };

    setActiveElement = (element: any) => {
        this.activeElement = element;
    };

    get workflowId(): string {
        if (!this.currentWorkflow) {
            return "";
        }
        const parser = new DOMParser();
        // Parse the currentWorkflow string into an XML document
        const xmlDoc = parser.parseFromString(
            this.currentWorkflow,
            "application/xml"
        );
        // Use querySelector to find the bpmn:process element
        const processElement = xmlDoc.getElementsByTagNameNS("*", "process")[0];

        // Return the id attribute of the bpmn:process element, or null if not found
        return processElement ? processElement.getAttribute("id") ?? "" : "";
    }

    launchWorkflow = async (): Promise<[string, boolean]> => {
        if (!this.modeler || !this.currentWorkflow || !this.workflowId) {
            return ["Modeler not initialized", false];
        }

        const base64EncodedWorkflow = Buffer.from(
            this.currentWorkflow
        ).toString("base64");
        const base64EncodedVariables = Buffer.from(
            JSON.stringify({
                _globalContext_user: this.rootStore.user.currentUser?.email,
            })
        ).toString("base64");

        const response = await this.workflowService.launchWorkflow(
            this.workflowId,
            base64EncodedWorkflow,
            base64EncodedVariables
        );
        if (response[1]) {
            return ["Workflow Started", true];
        }

        return ["Service Unavailable", false];
    };

    fetchWorkflow = async (workflowId: string): Promise<any> => {
        if (workflowId === "default") {
            runInAction(() => {
                this.currentWorkflow = defaultXml;
            });
            return defaultXml;
        }
        // TODO: Implement fetchWorkflow
        //const response = await this.workflowService.get(`/workflow/${workflowId}`);
        //return response.data;
        throw new Error("Not implemented");
    };
}
