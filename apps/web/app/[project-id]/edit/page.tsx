"use client";

import "./style.css";

import { Config, Data, Render } from "@measured/puck";
import { Puck } from "@measured/puck";
import { useEffect, useState } from "react";
// import headingAnalyzer from "@measured/puck-plugin-heading-analyzer/src/HeadingAnalyzer";
import config, { initialData } from "../../../config";
import Image from "next/image";
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

   const [isEdit, setIsEdit] = useState<boolean>(false);

   const handleToggle = () => {
      setIsEdit(!isEdit);
   };

   const editSwitch = <Switch isOn={isEdit} handleToggle={handleToggle} />;

   const toolbarItems = [
      { key: "edit", icon: "/edit.png", component: editSwitch },
   ];

   return (
      <div className="editor">
         <Toolbar items={toolbarItems} />
         <div className="puckContainer">
            {isEdit ? (
               <Puck
                  config={config as Config}
                  data={data}
                  onPublish={async (data: Data) => {
                     localStorage.setItem(key, JSON.stringify(data));
                  }}
                  onChange={setData}
                  headerPath={path}
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

type ToolbarProps = {
   items: ToolbarItemProps[];
};

type ToolbarItemProps = {
   key: string;
   icon: any;
   component: any;
};

function Toolbar({ items }: ToolbarProps) {
   return (
      <div className="toolbar">
         {items.map((item) => (
            <div className="toolbar-item" key={item.key}>
               <Icon
                  src={item.icon}
                  width={20}
                  height={20}
                  color="rgb(141, 98, 134)"
               />
               {item.component}
            </div>
         ))}
      </div>
   );
}

const Switch = ({ isOn, handleToggle }) => {
   return (
      <>
         <input
            checked={isOn}
            onChange={handleToggle}
            id={`switch`}
            type="checkbox"
         />
         <label className="switch-label" htmlFor={`switch`}>
            <span className={`switch-button`} />
         </label>
      </>
   );
};
