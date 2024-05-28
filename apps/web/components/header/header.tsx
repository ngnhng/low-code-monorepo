import Link from "next/link";

import { ArrowLeft, ChevronDownIcon, Slash } from "lucide-react";
import { useMobxStore } from "../../lib/mobx/store-provider";
import { observer } from "mobx-react-lite";
import useSWR from "swr";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@repo/ui";
import { useParams } from "next/navigation";

export const Header = observer(() => {
    const {
        projectData: { projects, currentProjectName, fetchProjectList },
        workflow: { workflowNameList, fetchWorkflowNameList },
        tableData: { fetchTables },
    } = useMobxStore();

    useSWR("project-list", () => fetchProjectList(), {
        revalidateOnFocus: false,
    });

    const { projectId, workflowId, routeId, tableId } = useParams();

    const { data: tables } = useSWR<any>(["tables", projectId], () =>
        fetchTables()
    );

    useSWR(["workflows", projectId], () => fetchWorkflowNameList());

    console.log("path", useParams());

    const projectIds = projects?.map((project) => project.pid);
    const workflowIds = [...workflowNameList]?.map((workflow) => workflow.wid);
    const routes = projects?.views?.map((view) => view.uiData.route);

    console.log("workflowIds", workflowIds);
    console.log("workflowNameList", workflowNameList);

    return (
        <div className="w-full h-16 flex px-[50px] gap-5 items-center border-b-2 border-b-gray-100 box-border">
            <Link
                href="/projects"
                className="rounded-full hover:bg-slate-100 p-1"
            >
                <ArrowLeft />
            </Link>
            {/*<div className="font-semibold text-sm">{headerTitle}</div>*/}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-1.5">
                                {currentProjectName}
                                <ChevronDownIcon />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                {projectIds?.map((id) => (
                                    <DropdownMenuItem key={id}>
                                        <BreadcrumbLink href={`/${id}/edit`}>
                                            {
                                                projects?.find(
                                                    (project) =>
                                                        project.pid === id
                                                )?.title
                                            }
                                        </BreadcrumbLink>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </BreadcrumbItem>
                    {workflowId && (
                        <>
                            <BreadcrumbSeparator>
                                <Slash />
                            </BreadcrumbSeparator>
                            <BreadcrumbItem>
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="flex items-center gap-1.5">
                                        {[...workflowNameList]?.find(
                                            (workflow) =>
                                                workflow.wid === workflowId
                                        )?.title ?? `${workflowId}`}
                                        <ChevronDownIcon />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        {workflowIds?.map((id) => (
                                            <DropdownMenuItem key={id}>
                                                <BreadcrumbLink
                                                    href={`/${projectId}/workflow/${id}`}
                                                >
                                                    {
                                                        [
                                                            ...workflowNameList,
                                                        ]?.find(
                                                            (workflow) =>
                                                                workflow.wid ===
                                                                id
                                                        )?.title
                                                    }
                                                </BreadcrumbLink>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </BreadcrumbItem>
                        </>
                    )}
                    {routeId && (
                        <>
                            <BreadcrumbSeparator>
                                <Slash />
                            </BreadcrumbSeparator>
                            <BreadcrumbItem>
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="flex items-center gap-1.5">
                                        {routes?.find(
                                            (route) => route === routeId
                                        ) ?? `${routeId}`}
                                        <ChevronDownIcon />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        {routes?.map((route) => (
                                            <DropdownMenuItem key={route}>
                                                <BreadcrumbLink
                                                    href={`/${projectId}/edit/${route}`}
                                                >
                                                    {route}
                                                </BreadcrumbLink>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </BreadcrumbItem>
                        </>
                    )}
                    {tableId && (
                        <>
                            <BreadcrumbSeparator>
                                <Slash />
                            </BreadcrumbSeparator>
                            <BreadcrumbItem>
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="flex items-center gap-1.5">
                                        {tables?.find(
                                            (table) => table.id === tableId
                                        )?.label ?? `${tableId}`}
                                        <ChevronDownIcon />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        {tables?.map((table) => (
                                            <DropdownMenuItem key={table.id}>
                                                <BreadcrumbLink
                                                    href={`/${projectId}/data/${table.id}`}
                                                >
                                                    {table.label}
                                                </BreadcrumbLink>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </BreadcrumbItem>
                        </>
                    )}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );
});
