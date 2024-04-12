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
import defaultXml from "../app/[projectId]/workflow/_testdata/default-xml";
import googleSheetXml from "../app/[projectId]/workflow/_testdata/google-sheet-xml";

export interface IWorkflowStore {
    newRenderer: (options?: any) => Promise<any> | any;
    //  setRenderer: (renderer: any) => void;

    workflowNameList: Set<string>;

    currentWorkflow: any;
    modeler: any;
    activeElement: any;

    currentExecutingWorkflowId: string;
    currentExecutingElementId: string;
    currentExecutingStatus: string;

    setCurrentWorkflow: (workflow: any) => void;
    getCurrentWorkflow: () => any;
    setModeler: (modeler: any) => void;
    getModeler: () => any;
    setActiveElement: (element: any) => void;
    setWorkflowName: (workflowName: string) => void;

    launchWorkflow: () => Promise<[string, boolean]>;
    fetchWorkflow: () => Promise<any>;
    fetchWorkflowNameList: () => Promise<Set<string>>;

    // per user set names of the bpmn workflows
    workflowName: string;
}

export class WorkflowStore {
    //observables
    workflowName = "default";
    workflowNameList: Set<string>;
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
            workflowName: observable,
            workflowNameList: observable,
            // js strings are immutable, so we can use observable instead of observable.ref
            currentExecutingWorkflowId: observable,
            currentExecutingElementId: observable,
            currentExecutingStatus: observable,
            //action
            //  setRenderer: action,
            setCurrentWorkflow: action,
            setModeler: action,
            setActiveElement: action,
            setWorkflowName: action,
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
        this.workflowNameList = new Set();
    }

    newRenderer = async (options?: any) => {
        console.log("newRenderer");
        if (!this.modeler) {
            const m = await this.workflowService.renderer(options);
            await m.importXML(this.currentWorkflow);
            runInAction(() => {
                this.modeler = m;
            });
            return m;
        }
        return this.modeler;
    };

    //  setRenderer = async (renderer: any) => {
    //    this.renderer = await this.workflowService.renderer();
    //  };

    setCurrentWorkflow = (workflow: any) => {
        this.currentWorkflow = workflow;
    };

    getCurrentWorkflow = () => {
        return this.currentWorkflow;
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
                _globalContext_user:
                    this.rootStore.user.currentUser?.email || "none",
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

    setWorkflowName = (workflowName: string) => {
        runInAction(() => {
            this.workflowName = workflowName;
        });
    };

    fetchWorkflow = async (): Promise<any> => {
        console.log(
            "fetchWorkflowByName",
            this.workflowName,
            this.workflowName == "google-sheet-example"
        );

        switch (this.workflowName) {
            case "default": {
                runInAction(() => {
                    this.currentWorkflow = defaultXml;
                });
                return defaultXml;
            }
            case "google-sheet-example": {
                runInAction(() => {
                    this.currentWorkflow = googleSheetXml;
                });
                return googleSheetXml;
            }
            default: {
                // TODO: Implement fetchWorkflow
                //const response = await this.workflowService.get(`/workflow/${workflowId}`);
                //return response.data;
                throw new Error("Not implemented");
            }
        }
    };

    fetchWorkflowNameList = async (): Promise<Set<string>> => {
        const response = await this.workflowService.fetchWorkflowNameList();
        runInAction(() => {
            this.workflowNameList = response;
        });
        return response;
    };
}
