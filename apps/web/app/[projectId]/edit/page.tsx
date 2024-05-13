"use client";

import Title from "components/title/title";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Button,
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    Input,
    Label,
    DialogFooter,
    DialogClose,
} from "@repo/ui";
import useSWR from "swr";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useMobxStore } from "../../../lib/mobx/store-provider";
import { observer } from "mobx-react-lite";
import { toast } from "sonner";
import { useState } from "react";

const Loading = () => <div>Loading...</div>;

const Error = ({ message }) => <div>{message}</div>;

const RouteRow = ({ routeData, projectId }) => (
    <TableRow className="hover:bg-slate-100 p-0" key={routeData.id}>
        <TableCell className="font-medium w-full relative">
            <Link
                href={`/${projectId}/edit${routeData.uiData.route}`}
                className="w-full hover:cursor-pointer"
            >
                <div className="w-full p-5">{routeData.uiData.route}</div>
            </Link>
        </TableCell>
        <TableCell className="text-right">
            <button className="p-2.5 rounded-md hover:text-red-500">
                <Trash2 />
            </button>
        </TableCell>
    </TableRow>
);

const ViewsTable = observer(
    ({ projectId, data }: { projectId: string; data: any }) => {
        const routeRows: JSX.Element[] = [];
        for (const route of data.views) {
            console.log(route);
            routeRows.push(
                <RouteRow
                    key={route.id}
                    routeData={route}
                    projectId={projectId}
                />
            );
        }

        return (
            <div className="w-full rounded-md border-2 border-slate-300 p-5">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Route</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>{routeRows}</TableBody>
                </Table>
            </div>
        );
    }
);

const CreatePageDialog = observer(({ mutate }: { mutate: any }) => {
    const {
        projectData: { currentProjectId, createView },
    } = useMobxStore();

    const [route, setRoute] = useState("");
    const [title, setTitle] = useState("");

    const handleCreatePage = async (route: string, title: string) => {
        if (!route || !title || !currentProjectId) {
            toast.error("Route and title are required!");
            return;
        }
        await createView(route, title, currentProjectId)
            .then(() => {
                toast.success("Page created successfully!");
                mutate();
            })
            .catch((error) => {
                toast.error(error.message);
            });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="w-full">Create new page</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        Create a new page for your project
                    </DialogTitle>
                </DialogHeader>
                <form className="flex flex-col gap-5">
                    <div>
                        <Label htmlFor="route">Route</Label>
                        <Input
                            id="route"
                            aria-label="Route"
                            placeholder="/new-page"
                            value={route}
                            className="w-full"
                            onChange={(event) => setRoute(event.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            aria-label="Title"
                            placeholder="New Page"
                            className="w-full"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                        />
                    </div>
                </form>
                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <Button
                            onClick={() => {
                                handleCreatePage(route, title);
                            }}
                        >
                            Create
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
});

export default function Page({ params }: { params: { projectId: string } }) {
    const { projectId } = params;
    const {
        projectData: { getProjectById },
    } = useMobxStore();

    const { data, isLoading, error, mutate } = useSWR<any>(
        ["view", projectId],
        () => getProjectById(projectId),
        {
            revalidateOnFocus: false,
            revalidateIfStale: false,
        }
    );

    if (isLoading || !data) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (
        <div className="w-full h-full rounded-md border-2 border-slate-300 p-[30px] flex flex-col gap-5">
            <Title name="UI Builder" description="Think fast!" />
            <div className="w-full h-[1px] bg-slate-300"></div>
            <CreatePageDialog mutate={mutate} />
            <ViewsTable projectId={projectId} data={data} />
        </div>
    );
}
