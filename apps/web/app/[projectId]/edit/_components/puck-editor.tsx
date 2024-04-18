/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";

import "../style.css";

import type { Data } from "@measured/puck";
import { Render, Puck } from "@measured/puck";
import "@measured/puck/puck.css";

import config, { initialData } from "../_config";

import { Label, Switch } from "@repo/ui";

interface ToolbarProps {
  items: ToolbarItemProps[];
}

interface ToolbarItemProps {
  key: string;
  icon: any;
  component: any;
}

interface PuckEditorProps {
  isEdit: boolean;
}

const isBrowser = typeof window !== "undefined";

export const PuckEditor = ({ isEdit }: PuckEditorProps) => {
  const path = "/";
  const componentKey = Buffer.from(
    Object.keys(config.components).join("-")
  ).toString("base64");
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

  if (!isEdit) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="w-full h-full overflow-auto">
          <Render
            config={config}
            data={
              data ?? {
                content: [],
                root: { props: { title: "Test" } },
                zones: {},
              }
            }
          />
        </div>
      </div>
    );
  }

  return (
    <>
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
          <div className="bg-slate-100 rounded-md border-2 border-slate-300 w-52 overflow-auto">
            <Puck.Fields />
          </div>
          <div className="h-full flex-1 border-2 border-slate-300 rounded-md p-2.5 overflow-auto">
            <Puck.Preview />
          </div>
          <div className="bg-slate-100 p-2.5 rounded-md border-2 border-slate-300 w-52 overflow-auto">
            <Puck.Components />
          </div>
        </div>
      </Puck>
    </>
  );
};

export const SwitchGroup = ({
  isOn,
  handleToggle,
}: {
  isOn: boolean;
  handleToggle: any;
}) => {
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
};

export const Toolbar = ({ items }: ToolbarProps) => {
  return (
    <div className="w-full border-2 border-slate-300 rounded-md h-14 flex gap-2.5 items-center px-5 box-border">
      {items.map((item) => (
        <div className="toolbar-item" key={item.key}>
          {item.component}
        </div>
      ))}
    </div>
  );
};
