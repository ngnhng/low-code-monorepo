"use client";

import "./style.css";

import { useState } from "react";
import { PuckEditor, SwitchGroup, Toolbar } from "./_components/puck-editor";

export default function Page() {
  const [isEdit, setIsEdit] = useState<boolean>(true);

  const handleToggle = () => {
    setIsEdit(!isEdit);
  };

  const editSwitch = <SwitchGroup handleToggle={handleToggle} isOn={isEdit} />;

  const toolbarItems = [
    { key: "edit", icon: "/edit.png", component: editSwitch },
  ];

  return (
    <div className="flex-1 flex flex-col gap-2.5">
      <Toolbar items={toolbarItems} />
      <div
        className={`${
          isEdit ? "flex" : "border-2 border-slate-300 rounded-md"
        } flex-1 box-border puckContainer ${
          isEdit ? "overflow-hidden" : "overflow-auto"
        }`}
      >
        <PuckEditor isEdit={isEdit} />
      </div>
    </div>
  );
}
