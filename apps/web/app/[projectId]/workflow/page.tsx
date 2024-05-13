"use client";

import { observer } from "mobx-react-lite";
import { useMobxStore } from "../../../lib/mobx/store-provider";
import useSWR from "swr";
import {
    WorkflowTable,
    columns,
} from "./_components/modeler-panel/workflow-table";
import Title from "../../../components/title/title";
import { Button } from "@repo/ui";
import { useRouter } from "next/navigation";

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
        projectData: { currentProjectId },
    } = useMobxStore();

    const router = useRouter();

    const { isLoading } = useSWR(
        ["workflow", "list", currentProjectId],
        () => fetchWorkflowNameList(),
        {
            revalidateOnFocus: false,
            revalidateIfStale: false,
        }
    );

    if (isLoading) {
        return <div>Loading...</div>;
    }

    const rows = [...workflowNameList].map((item) => ({
        id: item.wid,
        name: item.title,
        created: item.created,
        updated: item.created,
        status: "Active",
    }));

    console.log("Rows:", rows);

    const handleCreateWorkflow = () => {
        console.log("Create Workflow");
        // append /new to the current URL
        router.push(window.location.href + "/new");
    };

    return (
        <div className="flex flex-col space-y-4 mt-16">
            <div className="flex justify-between items-center">
                <Button onClick={handleCreateWorkflow}>Create Workflow</Button>
            </div>
            <WorkflowTable columns={columns as any} data={rows} />
        </div>
    );
});
