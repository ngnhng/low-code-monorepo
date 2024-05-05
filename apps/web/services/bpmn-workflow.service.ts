"use client";

import { APIService } from "./api.service";
import { BaseViewerOptions } from "bpmn-js/lib/BaseModeler";
import {
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule,
} from "bpmn-js-properties-panel";
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
            BpmnPropertiesPanelModule,
            BpmnPropertiesProviderModule,
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

    async fetchWorkflowNameList(): Promise<Set<string>> {
        try {
            const response = await this.get(`/api/workflow`);
            return response.status === 200
                ? new Set(response.data.ids)
                : new Set();
        } catch {
            throw new Error("Error calling service");
        }
    }

    async fetchWorkflowById(workflowId: string): Promise<any> {
        try {
            const response = await this.get(`/api/workflow/${workflowId}`);

            return response.status === 200 ? response.data : undefined;
        } catch {
            throw new Error("Error calling service");
        }
    }
}
