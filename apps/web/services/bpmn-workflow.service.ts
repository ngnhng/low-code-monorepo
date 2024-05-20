/* eslint-disable @typescript-eslint/no-unused-vars */
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
import lintModule from "bpmn-js-bpmnlint";
import conditionalFlows from "bpmnlint/rules/conditional-flows";
import endEventRequired from "bpmnlint/rules/end-event-required";
import noDisconnected from "bpmnlint/rules/no-disconnected";
import startEventRequired from "bpmnlint/rules/start-event-required";

export type LintRuleName = string;
export type CacheLintRuleName = `bpmnlint/${LintRuleName}`;
export type LintRuleFlag = "warn" | "error" | "info" | "off";

type Reporter = {
    report(
        id: string,
        message: string,
        path?: string[] | Record<string, string[] | string>
    ): void;
};
export type LintRuleLinter = {
    check: (node: any, reporter: Reporter) => undefined | void;
};

export type LintRules = Record<LintRuleName, LintRuleFlag>;

export const rules: LintRules = {
    "conditional-flows": "error",
    "end-event-required": "error",
    "no-disconnected": "error",
    "start-event-required": "error",
};

export const rulesCache: Record<CacheLintRuleName, LintRuleLinter> = {
    "bpmnlint/conditional-flows": conditionalFlows,
    "bpmnlint/end-event-required": endEventRequired,
    "bpmnlint/no-disconnected": noDisconnected,
    "bpmnlint/start-event-required": startEventRequired,
};

function Resolver() {}

Resolver.prototype.resolveRule = function (pkg: string, ruleName: string) {
    const rule = rulesCache[pkg + "/" + ruleName];

    if (!rule) {
        throw new Error("cannot resolve rule <" + pkg + "/" + ruleName + ">");
    }

    return rule;
};

Resolver.prototype.resolveConfig = function (pkg: string, configName: string) {
    throw new Error(
        "cannot resolve config <" + configName + "> in <" + pkg + ">"
    );
};

const getuiId = (wf: any) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(wf.wfData, "text/xml");
    const formElement = xmlDoc.getElementsByTagNameNS("*", "formListener")[0];
    const ui = formElement?.getAttribute("uiId");
    const component = formElement?.getAttribute("componentId");

    return [ui, component];
};

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
            lintModule,
        ];

        return new BpmnModeler({
            ...options,
            linting: {
                active: true,
                bpmnlint: {
                    resolver: new Resolver(),
                    config: {
                        rules,
                    },
                },
            },
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
            return response.data;
        } catch (error) {
            throw new Error(`Error calling service ${error}`);
        }
    }

    async fetchWorkflowNameList(projectId: string): Promise<
        Set<{
            title: string;
            wid: string;
            uiId: string;
            componentId: string;
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
                          uiId: getuiId(wf.wfData)[0],
                          componentId: getuiId(wf.wfData)[1],
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

    async fetchWorkflowStatus(instanceId, workflowId: string): Promise<any> {
        try {
            const response = await this.get(
                `/api/workflow/status/${instanceId}`
            );

            return response.status === 200 ? response.data : undefined;
        } catch {
            throw new Error("Error calling service");
        }
    }
}
