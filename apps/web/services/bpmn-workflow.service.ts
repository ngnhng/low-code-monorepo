"use client";

import { API_BASE_URL } from "../helpers/common.helper";
import { APIService } from "./api.service";
import { BaseViewerOptions } from "bpmn-js/lib/BaseModeler";
import {
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule,
} from "bpmn-js-properties-panel";
import CustomModule from "bpmn-js-custom";
import { gsModel } from "bpmn-js-custom";
import { ModdleExtensions } from "bpmn-js/lib/BaseViewer";

export class BpmnWorkflowService extends APIService {
    constructor() {
        super(API_BASE_URL + "/workflow");
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

        const moddleExtensions = {
            // custom: customModdle[1],
            gs: gsModel[1],
        };

        return new BpmnModeler({
            ...options,
            additionalModules,
            moddleExtensions: moddleExtensions
                ? (moddleExtensions as ModdleExtensions)
                : undefined,
        });
    }

}
