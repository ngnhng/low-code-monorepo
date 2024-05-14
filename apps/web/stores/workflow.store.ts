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
import googleSheetXml from "../app/[projectId]/workflow/_testdata/google-sheet-xml";

export interface IWorkflowStore {
    newRenderer: (options?: any) => Promise<any> | any;
    //  setRenderer: (renderer: any) => void;

    workflowNameList: Set<{
        title: string;
        wid: string;
        data: string;
        created: string;
    }>;

    currentWorkflow: any;
    modeler: any;
    activeElement: any;

    currentWorkflowId: string;
    currentExecutingElementId: string;
    currentExecutingStatus: string;

    setWorkflowId: (workflowId: string) => void;
    setCurrentWorkflow: (workflow: any) => void;
    getCurrentWorkflow: () => any;
    setModeler: (modeler: any) => void;
    getModeler: () => any;
    setActiveElement: (element: any) => void;
    setWorkflowName: (workflowName: string) => void;

    launchWorkflow: () => Promise<[string, boolean]>;
    fetchWorkflow: () => Promise<any>;
    fetchWorkflowById: (workflowId: string) => Promise<any>;
    fetchWorkflowNameList: () => Promise<
        Set<{
            title: string;
            wid: string;
            data: string;
            created: string;
        }>
    >;
    fetchDefaultWorkflow: () => Promise<any>;
    saveWorkflow: (title: string) => Promise<any>;
    updateWorkflow: (wid: string) => Promise<any>;

    // per user set names of the bpmn workflows
    workflowName: string;
}

const defaultXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
    xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
    xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
    id="Definitions_1pak3fd" 
    targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_0ritvl1" isExecutable="false" />
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_0ritvl1" />
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

export class WorkflowStore {
    //observables
    workflowName = "default";
    workflowNameList: Set<{
        title: string;
        wid: string;
        data: string;
        created: string;
    }>;
    currentWorkflow: any;
    modeler: any;
    activeElement: any;

    currentWorkflowId = "";
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
            currentWorkflowId: observable,
            currentExecutingElementId: observable,
            currentExecutingStatus: observable,
            //action
            //  setRenderer: action,
            setWorkflowId: action,
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
            //await m.importXML(this.currentWorkflow);
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

    setWorkflowId = (workflowId: string) => {
        this.currentWorkflowId = workflowId;
    };

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
        console.log("fetchWorkflowByName", this.workflowName);

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

    fetchWorkflowNameList = async (): Promise<
        Set<{
            title: string;
            wid: string;
            data: string;
            created: string;
        }>
    > => {
        return await this.workflowService
            .fetchWorkflowNameList(this.rootStore.projectData.currentProjectId)
            .then((res) => {
                runInAction(() => {
                    console.log("fetchWorkflowNameList", res);
                    this.workflowNameList = res;
                });
                return res;
            })
            .catch((error) => {
                console.error(error);
                return new Set();
            });
    };

    fetchWorkflowById = async (workflowId: string): Promise<any> => {
        console.log("fetchWorkflowById", workflowId);
        await this.workflowService
            .fetchWorkflowById(
                this.rootStore.projectData.currentProjectId,
                workflowId
            )
            .then((res) => {
                runInAction(() => {
                    this.currentWorkflow = res;
                });

                console.log("fetchWorkflowById", res);

                return res;
            })
            .catch((error) => {
                console.error(error);
                throw error;
            });
    };

    fetchDefaultWorkflow = async (): Promise<any> => {
        runInAction(() => {
            this.currentWorkflow = defaultXml;
        });
        return defaultXml;
    };

    saveWorkflow = async (title: string): Promise<any> => {
        console.log("saveWorkflow", title);

        const data = await this.modeler
            .saveXML({ format: true })
            .then((res: any) => {
                console.log("saveWorkflow", res?.xml);
                return res;
            });
        return await this.workflowService
            .saveWorkflow(
                this.rootStore.projectData.currentProjectId,
                title,
                data
            )
            .then((res) => {
                console.log("saveWorkflow", res);
                return res.data;
            })
            .catch((error) => {
                console.error(error);
                throw error;
            });
    };

    updateWorkflow = async (wid: string): Promise<any> => {

        const data = await this.modeler
            .saveXML({ format: true })
            .then((res: any) => {
                console.log("updateCurrentWorkflow", res?.xml);
                return res;
            });
        return await this.workflowService
            .updateWorkflow(
                this.rootStore.projectData.currentProjectId,
                wid,
                data
            )
            .then((res) => {
                console.log("updateCurrentWorkflow", res);
                return res.data;
            })
            .catch((error) => {
                console.error(error);
                throw error;
            });
    };
}
