import { useState } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@repo/ui";
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
// import { ConfirmModal } from "./confirm-modal";

const pseudoProjects = [
  {
    id: "trollface",
    name: "Secret Mission",
    owner: "Alice",
    updatedAt: "2024-05-07",
  },
  {
    id: "trollface",
    name: "Blue Sky Thinking",
    owner: "Bob",
    updatedAt: "2024-04-22",
  },
  {
    id: "trollface",
    name: "Marketing Blitz",
    owner: "Charlie",
    updatedAt: "2024-03-15",
  },
  {
    id: "trollface",
    name: "Innovation Engine",
    owner: "Diana",
    updatedAt: "2024-02-09",
  },
  {
    id: "trollface",
    name: "Data Deluge",
    owner: "Ethan",
    updatedAt: "2024-01-25",
  },
  {
    id: "trollface",
    name: "Customer Focus",
    owner: "Fiona",
    updatedAt: "2023-12-20",
  },
  {
    id: "trollface",
    name: "Global Expansion",
    owner: "Gabriel",
    updatedAt: "2023-11-11",
  },
  {
    id: "trollface",
    name: "Code Red",
    owner: "Hannah",
    updatedAt: "2023-10-07",
  },
  {
    id: "trollface",
    name: "Green Thumb",
    owner: "Isabella",
    updatedAt: "2023-09-04",
  },
  {
    id: "trollface",
    name: "Project Alpha",
    owner: "Jack",
    updatedAt: "2023-08-01",
  },
];

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
            <TableHead className="w-[900px]">Name</TableHead>
            <TableHead className="w-[300px]">Owner</TableHead>
            <TableHead>Last edited</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projectList
            .filter((project) => {
              return search === ""
                ? project
                : project.name.toLowerCase().includes(search.toLowerCase()) ||
                    project.owner.toLowerCase().includes(search.toLowerCase());
            })
            .map((project, idx) => (
              <TableRow
                key={`${project.id}${idx}`}
                className="border-0"
                onClick={() => {
                  router.push(`/${project.id}/edit`);
                }}
              >
                <TableCell className="py-5">{project.name}</TableCell>
                <TableCell>{project.owner}</TableCell>
                <TableCell width={200}>{project.updatedAt}</TableCell>
                <TableCell>
                  <ConfirmModal
                    handleClick={handleClick}
                    projectId={project.id}
                  />
                </TableCell>
              </TableRow>
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
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            project and remove all of its data.
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

export const ProjectLists = () => {
  const [search, setSearch] = useState("");
  const [list] = useState(pseudoProjects);

  return (
    <>
      <TopSection setSearch={setSearch} />
      <div className="w-full h-[1px] bg-slate-300"></div>
      <ProjectList search={search} projectList={list} />
    </>
  );
};