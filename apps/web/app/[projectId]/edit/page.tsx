"use client";

import "./style.css";
import "@measured/puck/puck.css";

import type { Config, Data} from "@measured/puck";
import { Render, Puck } from "@measured/puck";
import { useEffect, useState } from "react";
// import headingAnalyzer from "@measured/puck-plugin-heading-analyzer/src/HeadingAnalyzer";
import Image from "next/image";
import config, { initialData } from "../../../config";
import Icon from "../../components/Icon";

const isBrowser = typeof window !== "undefined";

export default function Page({ params }: { params: { "project-id": string } }) {
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

   const [isEdit, setIsEdit] = useState<boolean>(true);

   const handleToggle = () => {
      setIsEdit(!isEdit);
   };

   const editSwitch = <Switch handleToggle={handleToggle} isOn={isEdit} />;

   const toolbarItems = [
      { key: "edit", icon: "/edit.png", component: editSwitch },
   ];

   return (
      <div className="editor">
         <Toolbar items={toolbarItems} />
         <div className="puckContainer">
            {isEdit ? (
               <Puck
                  config={config}
                  data={data}
                  headerPath={path}
                  onChange={setData}
                  onPublish={async (data: Data) => {
                     localStorage.setItem(key, JSON.stringify(data));
                  }}
               />
            ) : (
               <Render
                  config={config as Config}
                  data={
                     data ?? {
                        content: [],
                        root: { title: "" },
                        zones: {},
                     }
                  }
               />
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
      <div className="toolbar">
         {items.map((item) => (
            <div className="toolbar-item" key={item.key}>
               <Icon
                  color="rgb(141, 98, 134)"
                  height={20}
                  src={item.icon}
                  width={20}
               />
               {item.component}
            </div>
         ))}
      </div>
   );
}

function Switch({ isOn, handleToggle }) {
   return (
      <>
         <input
            checked={isOn}
            id="switch"
            onChange={handleToggle}
            type="checkbox"
         />
         <label className="switch-label" htmlFor="switch">
            <span className="switch-button" />
         </label>
      </>
   );
}
