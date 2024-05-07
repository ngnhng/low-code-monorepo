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
    name: "This is a project name",
    owner: "Try guessing my name",
    lastEdited: Date.now(),
  },
  {
    id: "trollface",
    name: "This is a project name",
    owner: "Try guessing my name",
    lastEdited: Date.now(),
  },
  {
    id: "trollface",
    name: "This is a project name",
    owner: "Try guessing my name",
    lastEdited: Date.now(),
  },
  {
    id: "trollface",
    name: "This is a project name",
    owner: "Try guessing my name",
    lastEdited: Date.now(),
  },
  {
    id: "trollface",
    name: "This is a project name",
    owner: "Try guessing my name",
    lastEdited: Date.now(),
  },
  {
    id: "trollface",
    name: "This is a project name",
    owner: "Try guessing my name",
    lastEdited: Date.now(),
  },
  {
    id: "trollface",
    name: "This is a project name",
    owner: "Try guessing my name",
    lastEdited: Date.now(),
  },
  {
    id: "trollface",
    name: "This is a project name",
    owner: "Try guessing my name",
    lastEdited: Date.now(),
  },
];

export const TopSection = (): JSX.Element => {
  return (
    <div className="w-full flex gap-2.5 items-center">
      <Input placeholder="Search for projects" className="bg-white p-5" />
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

export const ProjectLists = (): JSX.Element => {
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
          {pseudoProjects.map((project, idx) => (
            <TableRow
              key={`${project.id}${idx}`}
              className="border-0"
              onClick={() => {
                router.push(`/${project.id}/edit`);
              }}
            >
              <TableCell className="py-5">{project.name}</TableCell>
              <TableCell>{project.owner}</TableCell>
              <TableCell>{project.lastEdited}</TableCell>
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

export const ConfirmModal = ({ handleClick, projectId }) => {
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
