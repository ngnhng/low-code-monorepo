"use client";

import { observer } from "mobx-react-lite";
import { useMobxStore } from "../../../lib/mobx/store-provider";
import useSWR from "swr";
import {
    WorkflowTable,
    columns,
} from "./_components/modeler-panel/workflow-table";
import Title from "../../../components/title/title";
import {
    Button,
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogTrigger,
    Input,
    Label,
} from "@repo/ui";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
        workflow: { fetchWorkflowNameList, workflowNameList, saveNewWorkflow },
        projectData: { currentProjectId },
    } = useMobxStore();

    const router = useRouter();

    const [newTitle, setNewTitle] = useState("Workflow Title");

    const { isLoading } = useSWR(
        ["workflows", currentProjectId],
        () => fetchWorkflowNameList(),
        {
            revalidateOnFocus: false,
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

    const handleCreateWorkflow = async () => {
        console.log("Create Workflow");
        //router.push(window.location.href + "/new");
        await saveNewWorkflow(newTitle)
            .then((res) => {
                console.log("Workflow Created:", res);
                router.push(window.location.href + "/" + res.wid);
            })
            .catch((error) => {
                console.log("Error:", error);
                toast.error("Failed to create workflow");
            });
    };

    return (
        <div className="flex flex-col pl-8 space-y-4 mt-16">
            <div className="flex justify-between items-center">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="flex gap-2.5">
                            <Plus />
                            Create Workflow
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <div className="flex flex-col gap-4 p-4">
                            <Label>Enter Workflow Title</Label>
                            <Input
                                type="text"
                                placeholder="Workflow Title"
                                onBlur={(e) => setNewTitle(e.target.value)}
                                className="p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button
                                    onClick={() => {
                                        handleCreateWorkflow();
                                    }}
                                >
                                    Save
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <WorkflowTable columns={columns as any} data={rows} />
        </div>
    );
});
