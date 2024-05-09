"use client";

import { observer } from "mobx-react-lite";
import { useMobxStore } from "../../../lib/mobx/store-provider";
import useSWR from "swr";
import {
    WorkflowTable,
    columns,
} from "./_components/modeler-panel/workflow-table";
import Title from "../../../components/title/title";

export default function Page() {
    return (
        <div className="flex flex-col w-full mt-8 p-4">
            <Title name="Workflows" description="List of all workflows" />
            <WorkflowList />{" "}
        </div>
    );
}

const WorkflowList = observer(() => {
    const {
        workflow: { fetchWorkflowNameList, workflowNameList },
    } = useMobxStore();

    const { isLoading } = useSWR(["workflow", "list"], () =>
        fetchWorkflowNameList()
    );

    if (isLoading) {
        return <div>Loading...</div>;
    }

    const rows = [...workflowNameList].map((name) => ({
        id: name.toLocaleLowerCase().replaceAll(/\s/g, "-"),
        name,
        created: "2021-09-01",
        updated: "2021-09-01",
        status: "Active",
    }));

    return (
        <div className="flex flex-col space-y-4 mt-16">
            <WorkflowTable columns={columns as any} data={rows} />
        </div>
    );
});
