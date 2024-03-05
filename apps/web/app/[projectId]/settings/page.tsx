import Title from 'components/title/title';
import { Input } from '@repo/ui';
import { Label } from '@repo/ui';
import { Button } from '@repo/ui';

import { Trash2 } from 'lucide-react';

export default function Page() {
  return (
    <div className="w-full h-full rounded-md border-2 border-slate-300 p-[30px] flex flex-col gap-5">
      <Title
        name="Project Settings"
        description="Do what you want here. I have no idea what you are gonna do."
      />
      <div className="w-full h-[1px] bg-slate-300"></div>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="pjName" className="font-bold">
          Project Name
        </Label>
        <Input type="text" id="pjName" placeholder="Project Name" className='border-slate-300 border-2' />
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label className="font-bold">
          Manage who can have access to this project
        </Label>
        <Input type="text" id="searchUser" placeholder="Search for a user by their username or email" className='border-slate-300 border-2' />
        <div className='flex flex-col gap-2.5 p-2.5 rounded-md border-2 border-slate-300'></div>
      </div>
      <div className="flex flex-col gap-1.5 w-min">
        <Label className="font-bold">Delete project</Label>
        <Button variant={'destructive'}>
          <div className="flex gap-2.5 items-center">
            <Trash2 />
            Delete project
          </div>
        </Button>
        <div className='text-red-500 text-sm'>This cannot be undone!</div>
      </div>
    </div>
  );
}
