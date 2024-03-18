'use client';

import { action, makeObservable, observable } from 'mobx';

import { RootStore } from './root';
import {
  GetTableDataParams,
  GetTableDataResponse,
  TableQueries,
} from 'types/table-data';
import { TableDataService } from 'services/table-data.service';

export interface ITableDataStore {
  tableIds: string[];
  appliedQueries: TableQueries;
  // eslint-disable-next-line no-unused-vars
  fetchTableData: (a0: GetTableDataParams) => Promise<GetTableDataResponse>;
  // eslint-disable-next-line no-unused-vars
  fetchAppliedQueries: (tableId: string) => any;
  fetchTables: () => any;
}

export class TableDataStore implements ITableDataStore {
  // observables
  tableIds: string[] = [];
  appliedQueries: TableQueries = {};

  // root store
  rootStore: RootStore;

  // service
  tableDataService: TableDataService;

  constructor(_rootStore: RootStore) {
    makeObservable(this, {
      //observables
      tableIds: observable,
      appliedQueries: observable,
      //use .ref annotation since immutability of tableData is expected.
      //see: https://mobx.js.org/observable-state.html#available-annotations
      //actions
      fetchTableData: action,
    });

    this.rootStore = _rootStore;
    this.tableDataService = new TableDataService();
  }

  fetchTableData = async ({
    tableId,
    page,
    limit,
    query,
  }: GetTableDataParams): Promise<GetTableDataResponse> => {
    try {
      const response = await this.tableDataService.getTableData({
        projectId: this.rootStore.projectData.currentProjectId,
        tableId,
        page,
        limit,
        query,
      });

      // temporary action that is immediately invoked
      if (response) {
        // validate
        return response;
      } else {
        throw new Error('Table data not found');
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  fetchAppliedQueries = (tableId: string) => {
    if (!this.appliedQueries[this.rootStore.projectData.currentProjectId]) {
      this.appliedQueries[this.rootStore.projectData.currentProjectId] = {};
    }

    return {
      page:
        this.appliedQueries[this.rootStore.projectData.currentProjectId]![
          tableId
        ]?.page ?? 0,
      limit:
        this.appliedQueries[this.rootStore.projectData.currentProjectId]![
          tableId
        ]?.limit ?? 30,
      query:
        this.appliedQueries[this.rootStore.projectData.currentProjectId]![
          tableId
        ]?.query ?? {},
    };
  };

  fetchTableRelations = async(tableId) => {
    try {
      const response = await this.tableDataService.getTableRelations({
        projectId: this.rootStore.projectData.currentProjectId,
        tableId: tableId,
      })

      if (response) {
        // validate
        return response;
      } else {
        throw new Error('Table data not found');
      }

    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  fetchTables = async () => {
    try {
      const response = await this.tableDataService.getTables({
        projectId: this.rootStore.projectData.currentProjectId,
      })

      if (response) {
        return response;
      } else {
        throw new Error('Table data not found');
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
}
