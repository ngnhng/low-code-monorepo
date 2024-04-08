"use client";

import { APIService } from "./api.service";
import { BaseViewerOptions } from "bpmn-js/lib/BaseModeler";
import {
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule,
} from "bpmn-js-properties-panel";
import CustomModule from "bpmn-js-custom";
import { gsModel } from "bpmn-js-custom";
//import { ModdleExtensions } from "bpmn-js/lib/BaseViewer";

export class BpmnWorkflowService extends APIService {
    constructor() {
        super(process.env.NEXT_PUBLIC_WORKFLOW_API_URL);
    }

    async renderer(options?: BaseViewerOptions) {
        const { default: BpmnModeler } = await import("bpmn-js/lib/Modeler");

        //let BpmnPropertiesPanelModule, BpmnPropertiesProviderModule;
        //if (typeof window !== 'undefined') {
        //  import('bpmn-js-properties-panel')
        //    .then((bpmnJsPropertiesPanel) => {
        //      BpmnPropertiesPanelModule =
        //        bpmnJsPropertiesPanel.BpmnPropertiesPanelModule;
        //      BpmnPropertiesProviderModule =
        //        bpmnJsPropertiesPanel.BpmnPropertiesProviderModule;
        //    })
        //    .catch((err) => console.log(err));
        //}

        const additionalModules = [
            BpmnPropertiesPanelModule,
            BpmnPropertiesProviderModule,
            CustomModule,
        ];

        //const moddleExtensions = {
        //    // custom: customModdle[1],
        //    yalc: gsModel[1],
        //};

        //if (!moddleExtensions) return;

        return new BpmnModeler({
            ...options,
            additionalModules,
            moddleExtensions: {
				yalc: gsModel[1]!,
			}
        });
    }

    async launchWorkflow(
        workflowId: string,
        wf: string,
        vars: string
    ): Promise<[string, boolean]> {
        try {
            const response = await this.post(`/workflow`, {
                workflow_id: workflowId,
                process_definition: wf,
                variable_mapping: vars,
            });
            return [response.data, true];
        } catch (error: any) {
            return [error.response.data.message, false];
        }
    }
}
