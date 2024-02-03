import BpmnJS from 'bpmn-js/dist/bpmn-modeler.production.min.js';
import { CLIENT_BASE_URL } from '../helpers/common.helper';
import { APIService } from './api.service';

export class BpmnWorkflowService extends APIService {
  constructor() {
    super(CLIENT_BASE_URL);
  }

  renderer(options?: any) {
    return new BpmnJS(options);
  }
}
