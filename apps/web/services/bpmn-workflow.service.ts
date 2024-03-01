'use client';

import { CLIENT_BASE_URL } from '../helpers/common.helper';
import { APIService } from './api.service';
import { BaseViewerOptions } from 'bpmn-js/lib/BaseModeler';
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
} from 'bpmn-js-properties-panel';
import CustomModule from 'bpmn-js-custom';
import { customModdle, gsModel } from 'bpmn-js-custom';

export class BpmnWorkflowService extends APIService {
  constructor() {
    super(CLIENT_BASE_URL);
  }

  async renderer(options?: BaseViewerOptions) {
    const { default: BpmnModeler } = await import('bpmn-js/lib/Modeler');

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
      custom: customModdle[1],
      gs: gsModel[1]
    };

    const modeler = new BpmnModeler({
      ...options,
      additionalModules,
      moddleExtensions,
    });

    return modeler;
  }
}
