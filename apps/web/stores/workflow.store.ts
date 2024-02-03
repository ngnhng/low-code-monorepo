import { makeObservable, observable, action } from 'mobx';
import { RootStore } from './root';
import { BpmnWorkflowService } from 'services/bpmn-workflow.service';

export interface IWorkflowStore {
  renderer: any;
  setRenderer: (renderer: any) => void;

  workflow: any;
  setWorkflow: (workflow: any) => void;

  //  fetchWorkflow: (id: string) => Promise<any>;

  //  fetchWorkflowList: () => Promise<any>;
}

export class WorkflowStore {
  //observables
  renderer: any;

  workflow: any;

  // root store
  rootStore: RootStore;

  //service
  workflowService: BpmnWorkflowService;

  constructor(_rootStore: RootStore) {
    makeObservable(this, {
      //observable
      renderer: observable.ref,
      workflow: observable.ref,
      //action
      setRenderer: action,
      setWorkflow: action,
      //  fetchWorkflow: action,
      //  fetchWorkflowList: action,
      //computed
    });

    this.rootStore = _rootStore;
    this.workflowService = new BpmnWorkflowService();

    this.renderer = undefined;
    this.workflow = undefined;
  }

  setRenderer = async (renderer: any) => {
    this.renderer = await this.workflowService.renderer();
  };

  setWorkflow = (workflow: any) => {
    this.workflow = workflow;
  };

  //  fetchWorkflow = async (id: string) => {
  //    try {
  //      const response = await this.workflowService.workflow(id);
  //      if (response) {
  //        this.setWorkflow(response);
  //      }
  //    } catch (error) {
  //      console.error('fetchWorkflow', error);
  //    }
  //  };

  //  fetchWorkflowList = async () => {
  //    try {
  //      const response = await this.workflowService.workflowList();
  //      if (response) {
  //        this.setWorkflow(response);
  //      }
  //    } catch (error) {
  //      console.error('fetchWorkflowList', error);
  //    }
  //  };
}
