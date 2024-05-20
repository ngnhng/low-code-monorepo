"use client";

import { action, makeObservable, observable, runInAction } from "mobx";

import { RootStore } from "./root";
import {
    GetTableDataParams,
    GetTablesResponse,
    // GetTableDataResponse,
    TableQueries,
} from "types/table-data";
import { TableDataService } from "services/table-data.service";

export interface ITableDataStore {
    tableIds: string[];
    appliedQueries: TableQueries;
    // eslint-disable-next-line no-unused-vars
    fetchTableData: (a0: GetTableDataParams, yalcToken) => any;
    // eslint-disable-next-line no-unused-vars
    fetchAppliedQueries: (tableId: string) => any;
    fetchTables: () => any;
    fetchTablesByProjectId: (projectId: string) => any;

    fetchTableColumns: (yalcToken: string, tableId: string) => any;
    fetchTableRelations: (tableId: string) => any;

    insertRow: ({
        tableId,
        data,
        projectId,
    }: {
        tableId: string;
        data: Record<string, string>;
        projectId?: string;
    }) => any;
}

export class TableDataStore implements ITableDataStore {
    // observables
    tableIds: string[] = [];
    appliedQueries: TableQueries = {};

    tables: GetTablesResponse[] = [];

    // service
    tableDataService: TableDataService;
    // root store
    rootStore: RootStore;

    constructor(_rootStore: RootStore) {
        makeObservable(this, {
            //observables
            tableIds: observable,
            appliedQueries: observable,
            tables: observable,
            //use .ref annotation since immutability of tableData is expected.
            //see: https://mobx.js.org/observable-state.html#available-annotations
            //actions
            fetchTableData: action,
        });

        this.rootStore = _rootStore;
        this.tableDataService = new TableDataService();
    }

    fetchTableData = async (
        { tableId, query }: GetTableDataParams,
        yalcToken
    ) => {
        try {
            const response = await this.tableDataService.getTableData({
                projectId: this.rootStore.projectData.currentProjectId,
                tableId,
                query,
                yalcToken,
            });

            return response;
        } catch (error) {
            console.log(error);
            throw error;
        }
    };

    fetchTableColumns = async (yalcToken: string, tableId: string) => {
        try {
            const response = await this.tableDataService.getTableColumns({
                projectId: this.rootStore.projectData.currentProjectId,
                tableId,
                yalcToken,
            });

            return response;
        } catch (error) {
            console.log("[FETCH_TABLE_COL_ERROR]", error);
            throw error;
        }
    };

    fetchAppliedQueries = (tableId: string) => {
        if (!this.appliedQueries[this.rootStore.projectData.currentProjectId]) {
            this.appliedQueries[this.rootStore.projectData.currentProjectId] =
                {};
        }

        return {
            page:
                this.appliedQueries[
                    this.rootStore.projectData.currentProjectId
                ]![tableId]?.page ?? 0,
            limit:
                this.appliedQueries[
                    this.rootStore.projectData.currentProjectId
                ]![tableId]?.limit ?? 30,
            query:
                this.appliedQueries[
                    this.rootStore.projectData.currentProjectId
                ]![tableId]?.query ?? {},
        };
    };

    fetchRelationalTables = async (tableId: string) => {
        try {
            const response = await this.tableDataService.getRelationalTable({
                projectId: this.rootStore.projectData.currentProjectId,
                tableId: tableId,
            });

            response.push(tableId);

            const results = this.tables.filter((table) =>
                response.includes(table.id)
            );

            return results;
        } catch (error) {
            console.log("STORE_RELATIONAL_TABLES:", error);
        }
    };

    fetchTableRelations = async (tableId: string) => {
        try {
            const response = await this.tableDataService.getTableRelations({
                projectId: this.rootStore.projectData.currentProjectId,
                tableId: tableId,
            });

            if (response) {
                // validate
                return response;
            } else {
                throw new Error("Table data not found");
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
    };

    fetchTables = async () => {
        try {
            const response = await this.tableDataService.getTables({
                projectId: this.rootStore.projectData.currentProjectId,
            });

            if (response) {
                runInAction(() => {
                    this.tables = response;
                    // set tableIds
                    this.tableIds = response.map((table) => table.id);
                });
            }

            return response;
        } catch (error) {
            console.log("FETCH_TABLE_ERROR", error);
            throw error;
        }
    };

    fetchTablesByProjectId = async (projectId: string) => {
        try {
            const response = await this.tableDataService.getTables({
                projectId,
            });

            if (response) {
                runInAction(() => {
                    this.tables = response;
                    // set tableIds
                    this.tableIds = response.map((table) => table.id);
                });
                return response;
            }
        } catch (error) {
            console.log("FETCH_TABLE_ERROR", error);
            throw error;
        }
    };

    insertRow = async ({
        tableId,
        data,
        projectId,
    }: {
        tableId: string;
        data: Record<string, string>;
        projectId?: string;
    }) => {
        console.log("INSERT_ROW", data, projectId, tableId);
        try {
            const payload = {
                rows: [data],
            };

            const response = await this.tableDataService.insertRow({
                projectId:
                    projectId ?? this.rootStore.projectData.currentProjectId,
                tableId,
                data: payload,
            });

            return response;
        } catch (error) {
            console.log("INSERT_ROW_ERROR", error);
            throw error;
        }
    };
}
