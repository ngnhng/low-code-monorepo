"use client";

import { makeObservable, observable, action, computed } from "mobx";
import { RootStore } from "./root";
import { BpmnWorkflowService } from "services/bpmn-workflow.service";
import defaultXml from "../app/[projectId]/workflow/default-xml";

export interface IWorkflowStore {
    newRenderer: (options?: any) => Promise<any> | any;
    //  setRenderer: (renderer: any) => void;

    currentWorkflow: any;
    modeler: any;
    activeElement: any;

    setCurrentWorkflow: (workflow: any) => void;
    setModeler: (modeler: any) => void;
    getModeler: () => any;
    setActiveElement: (element: any) => void;

    launchWorkflow: () => Promise<[string, boolean]>;
    fetchWorkflow: (workflowId: string) => Promise<[any, boolean]>;

    workflowId: string;
}

export class WorkflowStore {
    //observables
    currentWorkflow: any;
    modeler: any;
    activeElement: any;

    // root store
    rootStore: RootStore;

    //service
    workflowService: BpmnWorkflowService;

    constructor(_rootStore: RootStore) {
        makeObservable(this, {
            //observable
            currentWorkflow: observable.ref,
            modeler: observable.ref,
            activeElement: observable.ref,
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

    newRenderer = (options?: any) => {
        return this.workflowService.renderer(options);
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

    get workflowId() {
        if (!this.currentWorkflow) {
            return;
        }
        const parser = new DOMParser();
        // Parse the currentWorkflow string into an XML document
        const xmlDoc = parser.parseFromString(
            this.currentWorkflow,
            "application/xml"
        );
        // Use querySelector to find the bpmn:process element
        const processElement = xmlDoc.querySelector(`bpmn\\:process`);

        // Return the id attribute of the bpmn:process element, or null if not found
        return processElement ? processElement.getAttribute("id") : undefined;
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
            return ["Workflow launched successfully", true];
        }

        return ["Failed to launch workflow", false];
    };

    fetchWorkflow = async (workflowId: string): Promise<[any, boolean]> => {
        if (workflowId === "default") {
            return [defaultXml, true];
        }
        // TODO: Implement fetchWorkflow
        //const response = await this.workflowService.get(`/workflow/${workflowId}`);
        //return response.data;
        return ["", false];
    };
}
