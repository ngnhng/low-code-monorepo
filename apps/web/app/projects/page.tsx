'use client';

import './styles.css';

import Link from 'next/link';

import Title from 'components/title/title';
import { Input, Button } from '@repo/ui';
import { Filter, PlusCircle, MoreVertical } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';

import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui';

const pseudoProjects = [
  {
    id: 'trollface',
    name: 'This is a project name',
    owner: 'Try guessing my name',
    lastEdited: Date.now(),
  },
  {
    id: 'trollface',
    name: 'This is a project name',
    owner: 'Try guessing my name',
    lastEdited: Date.now(),
  },
  {
    id: 'trollface',
    name: 'This is a project name',
    owner: 'Try guessing my name',
    lastEdited: Date.now(),
  },
  {
    id: 'trollface',
    name: 'This is a project name',
    owner: 'Try guessing my name',
    lastEdited: Date.now(),
  },
  {
    id: 'trollface',
    name: 'This is a project name',
    owner: 'Try guessing my name',
    lastEdited: Date.now(),
  },
];

const TopSection = (): JSX.Element => {
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
      <Button>
        <div className="flex gap-[10px]">
          <PlusCircle size={20} />
          Create new project
        </div>
      </Button>
    </div>
  );
};

const ProjectLists = (): JSX.Element => {
  return (
    <div className="bg-white rounded-md p-[20px] border-2 border-slate-200">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[900px]">Name</TableHead>
            <TableHead className="w-[300px]">Owner</TableHead>
            <TableHead>Last edited</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pseudoProjects.map((project, idx) => (
            <TableRow
              key={`${project.id}${idx}`}
              className="border-0"
              onClick={(e) => {
                open(`/${project.id}/edit`);
              }}
            >
              <TableCell className='py-5'>{project.name}</TableCell>
              <TableCell>{project.owner}</TableCell>
              <TableCell>{project.lastEdited}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default function Page() {
  return (
    <>
      <Title
        name="Projects"
        description="Browse through your working projects or create a new one"
      />
      <div className="w-full bg-slate-50 p-5 rounded-md border-2 border-slate-200 flex flex-col gap-5">
        <TopSection />
        <div className="w-full h-[1px] bg-slate-300"></div>
        <ProjectLists />
      </div>
    </>
  );
}
