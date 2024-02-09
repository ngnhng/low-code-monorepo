'use client';

import './style.css';

import type { Data } from '@measured/puck';
import { Render, Puck } from '@measured/puck';
import '@measured/puck/puck.css';

import { useState } from 'react';
import config, { initialData } from './_config';
import { Switch, Label } from '@repo/ui';

const isBrowser = typeof window !== 'undefined';

export default function Page({ params }: { params: { projectId: string } }) {
  const path = '/';
  const componentKey = Buffer.from(
    Object.keys(config.components).join('-'),
  ).toString('base64');
  const key = `puck-demo:${componentKey}:${path}`;

  const [data, setData] = useState<Data>(() => {
    if (isBrowser) {
      const dataStr = localStorage.getItem(key);

      if (dataStr) {
        return JSON.parse(dataStr);
      }

      return initialData[path] ?? undefined;
    }
  });

  const [isEdit, setIsEdit] = useState<boolean>(true);

  const handleToggle = () => {
    setIsEdit(!isEdit);
  };

  const editSwitch = <SwitchGroup handleToggle={handleToggle} isOn={isEdit} />;

  const toolbarItems = [
    { key: 'edit', icon: '/edit.png', component: editSwitch },
  ];

  return (
    <div className="flex-1 flex flex-col gap-2.5">
      <Toolbar items={toolbarItems} />
      <div
        className={`${
          isEdit ? 'flex' : 'border-2 border-slate-300 rounded-md'
        } flex-1 box-border puckContainer ${isEdit ? "overflow-hidden" : "overflow-auto"}`}
      >
        {isEdit ? (
          // https://puckeditor.com/docs/extending-puck/custom-interfaces
          <Puck
            config={config}
            data={data}
            headerPath={path}
            onChange={setData}
            onPublish={async (data: Data) => {
              localStorage.setItem(key, JSON.stringify(data));
            }}
          >
            <div className="gap-2.5 flex-1 overflow-hidden flex">
              <div className="bg-slate-100 rounded-md border-2 border-slate-300 w-52">
                <Puck.Fields />
              </div>
              <div className="h-full flex-1 border-2 border-slate-300 rounded-md p-2.5 overflow-auto">
                <Puck.Preview />
              </div>
              <div className="bg-slate-100 p-2.5 rounded-md border-2 border-slate-300 w-52">
                <Puck.Components />
              </div>
            </div>
          </Puck>
        ) : (
          <div className='flex-1 overflow-auto'>
            <div className="w-full h-full overflow-auto">
              <Render
                config={config}
                data={
                  data ?? {
                    content: [],
                    root: { props: { title: 'Test' } },
                    zones: {},
                  }
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ToolbarProps {
  items: ToolbarItemProps[];
}

interface ToolbarItemProps {
  key: string;
  icon: any;
  component: any;
}

function Toolbar({ items }: ToolbarProps) {
  return (
    <div className="w-full border-2 border-slate-300 rounded-md h-14 flex gap-2.5 items-center px-5 box-border">
      {items.map((item) => (
        <div className="toolbar-item" key={item.key}>
          {item.component}
        </div>
      ))}
    </div>
  );
}

function SwitchGroup({
  isOn,
  handleToggle,
}: {
  isOn: boolean;
  handleToggle: any;
}) {
  return (
    <>
      <Label htmlFor="toggle-preview">Preview</Label>
      <Switch
        id="toggle-preview"
        checked={!isOn}
        onCheckedChange={() => handleToggle()}
      />
    </>
  );
}
