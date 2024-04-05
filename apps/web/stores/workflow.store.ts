'use client';

import { makeObservable, observable, action } from 'mobx';
import { RootStore } from './root';
import { BpmnWorkflowService } from 'services/bpmn-workflow.service';

export interface IWorkflowStore {
  // eslint-disable-next-line no-unused-vars
  newRenderer: (options?: any) => Promise<any> | any;
  //  setRenderer: (renderer: any) => void;

  currentWorkflow: any;
  modeler: any;
  activeElement: any;
  // eslint-disable-next-line no-unused-vars
  setCurrentWorkflow: (workflow: any) => void;
  // eslint-disable-next-line no-unused-vars
  setModeler: (modeler: any) => void;
  getModeler: () => any;
  // eslint-disable-next-line no-unused-vars
  setActiveElement: (element: any) => void;

  //  fetchWorkflow: (id: string) => Promise<any>;

  //  fetchWorkflowList: () => Promise<any>;
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
  }

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
