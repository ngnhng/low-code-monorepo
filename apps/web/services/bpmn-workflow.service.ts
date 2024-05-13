"use client";

import { APIService } from "./api.service";
import { BaseViewerOptions } from "bpmn-js/lib/BaseModeler";
// import {
//     BpmnPropertiesPanelModule,
//     BpmnPropertiesProviderModule,
// } from "bpmn-js-properties-panel";
import CustomModule from "bpmn-js-custom";
import { gsModel } from "bpmn-js-custom";
import { CLIENT_BASE_URL } from "../helpers/common.helper";
//import { ModdleExtensions } from "bpmn-js/lib/BaseViewer";

export class BpmnWorkflowService extends APIService {
    constructor() {
        super(CLIENT_BASE_URL);
    }

    async renderer(options?: BaseViewerOptions) {
        const { default: BpmnModeler } = await import("bpmn-js/lib/Modeler");

        const additionalModules = [
            // BpmnPropertiesPanelModule,
            // BpmnPropertiesProviderModule,
            CustomModule,
        ];

        return new BpmnModeler({
            ...options,
            additionalModules,
            moddleExtensions: {
                yalc: gsModel[1]!,
            },
        });
    }

    async launchWorkflow(
        workflowId: string,
        wf: string,
        vars: string
    ): Promise<[string, boolean]> {
        try {
            const response = await this.post(`/api/workflow/launch`, {
                workflow_id: workflowId,
                process_definition: wf,
                variable_mapping: vars,
            });
            return response.status === 200
                ? [response.data, true]
                : [response.data, false];
        } catch {
            return ["Error requesting launch", false];
        }
    }

    async fetchWorkflowNameList(projectId: string): Promise<
        Set<{
            title: string;
            wid: string;
            data: string;
            created: string;
        }>
    > {
        try {
            const response = await this.get(
                `/api/projects/${projectId}/workflows`
            );
            console.log("Response", response);
            return response.status === 200
                ? new Set(
                      response.data.data.map((wf: any) => ({
                          title: wf.title,
                          wid: wf.wid,
                          data: wf.wfData,
                          created: new Intl.DateTimeFormat("en-US", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                          }).format(new Date(wf.createdAt)),
                      }))
                  )
                : new Set();
        } catch (error) {
            throw new Error(`Error calling service ${error}`);
        }
    }

    async fetchWorkflowById(pid: string, workflowId: string): Promise<any> {
        try {
            const response = await this.get(
                `/api/projects/${pid}/workflows/${workflowId}`
            );

            return response.status === 200 ? response.data : undefined;
        } catch {
            throw new Error("Error calling service");
        }
    }

    async saveWorkflow(pid, title: string, data: any): Promise<any> {
        const response = await this.post(
            `/api/projects/${pid}/workflows?title=${title}`,
            data?.xml
        );

        return response.status === 200 ? response.data : undefined;
    }

    async updateWorkflow(pid, workflowId: string, data: any): Promise<any> {
        if (!data || !data?.xml) {
            throw new Error("Data is required");
        }
        const response = await this.put(
            `/api/projects/${pid}/workflows/${workflowId}`,
            data?.xml
        );

        return response.status === 200 ? response.data : undefined;
    }
}
