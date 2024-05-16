/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Input, TableRowButton } from "@repo/ui";
import { Filter, Trash } from "lucide-react";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@repo/ui";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@repo/ui";

import {
    Button,
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@repo/ui";

import { CreateProjectForm } from "./create-project-form";
import useSWR from "swr";
import { useMobxStore } from "../../../lib/mobx/store-provider";
import { observer } from "mobx-react-lite";

const TopSection = ({ setSearch }): JSX.Element => {
    return (
        <div className="w-full flex gap-2.5 items-center">
            <Input
                placeholder="Search for projects"
                className="bg-white p-5"
                onChange={(e) => setSearch(e.target.value)}
            />
            <Filter />
            <Select>
                <SelectTrigger className="w-[180px] bg-white p-5">
                    <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="time">Last edited</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
            <CreateProjectForm />
        </div>
    );
};

const ProjectList = ({ projectList, search }): JSX.Element => {
    const router = useRouter();

    const {
        user: { currentUser },
    } = useMobxStore();

    const handleClick = (
        e: React.MouseEvent<HTMLButtonElement>
        // eslint-disable-next-line unicorn/consistent-function-scoping
    ) => {
        e.stopPropagation();
    };

    return (
        <div className="bg-white rounded-md p-[20px] border-2 border-slate-200">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead>Name</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Last edited</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {projectList
                        .filter((project) => {
                            return search === ""
                                ? project
                                : project.title
                                      .toLowerCase()
                                      .includes(search.toLowerCase()) ||
                                      currentUser?.email ||
                                      ""
                                          .toLowerCase()
                                          .includes(search.toLowerCase());
                        })
                        .map((project, idx) => (
                            <TableRowButton
                                key={`${project.id}${idx}`}
                                className="border-0"
                                onClick={() => {
                                    router.push(`/${project.pid}/edit`);
                                }}
                            >
                                <TableCell className="py-5">
                                    {project.title}
                                </TableCell>
                                <TableCell>{currentUser?.email}</TableCell>
                                <TableCell width={200}>
                                    {new Intl.DateTimeFormat("en-US").format(
                                        new Date(project.updatedAt)
                                    )}{" "}
                                </TableCell>
                                <TableCell>
                                    <ConfirmModal
                                        handleClick={handleClick}
                                        projectId={project.pid}
                                    />
                                </TableCell>
                            </TableRowButton>
                        ))}
                </TableBody>
            </Table>
        </div>
    );
};

const ConfirmModal = ({ handleClick, projectId }) => {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant={"outline"}
                    size={"icon"}
                    className="ml-2"
                    onClick={handleClick}
                >
                    <Trash className="h-5 w-5" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your project and remove all of its data.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => console.log(projectId)}>
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export const ProjectLists = observer(() => {
    const [search, setSearch] = useState("");

    const {
        projectData: { projects, fetchProjectList },
    } = useMobxStore();

    const { isLoading } = useSWR("/api/projects", () => fetchProjectList());

    if (isLoading || !projects) {
        return <div>Loading...</div>;
    }

    console.log(projects);

    return (
        <>
            <TopSection setSearch={setSearch} />
            <div className="w-full h-[1px] bg-slate-300"></div>
            <ProjectList search={search} projectList={projects} />
        </>
    );
});
