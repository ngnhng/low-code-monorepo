"use client";

import "../style.css";

import type { Data } from "@measured/puck";
import { Render, Puck } from "@measured/puck";
import "@measured/puck/puck.css";
import { Save } from "lucide-react";

import { useEffect, useState } from "react";
import config from "../_config";
import { Switch, Label, Input } from "@repo/ui";
import useSWR from "swr";
import { notFound } from "next/navigation";

export default function Page({ params }: { params: { routeId: string } }) {
    const componentKey = Buffer.from(Object.keys(config.components).join("-")).toString("base64");
    const key = `puck-demo:${componentKey}:${params.routeId}`;

    const [tempData, setTempData] = useState<any>();

    const { data, isLoading, error } = useSWR(`/api/ui/${params.routeId}`, async (url) => {
        const res = await fetch(url);

        if (res.status === 404) {
            throw new Error("Page not found");
        }

        return await res.json();
    });

    if (error) {
        notFound();
    }

    useEffect(() => {
        if (!data) return;
        setTempData(data);

        console.log(data);
    }, [isLoading, data]);

    // useEffect(() => {
    //     console.log(tempData);
    // }, [tempData])

    const [isEdit, setIsEdit] = useState<boolean>(true);

    const handleToggle = () => {
        setIsEdit(!isEdit);
    };

    const editSwitch = <SwitchGroup handleToggle={handleToggle} isOn={isEdit} disabled={isLoading} />;

    const pageRoute = (
        <>
            <Label className="w-auto">Route</Label>
            <Input
                placeholder="Empty route is treated as '/'"
                defaultValue={data?.route.slice(1) ?? ""}
                onBlur={(event) => {
                    // Do Something
                    console.log(event.target?.value);
                }}
            />
        </>
    );

    const saveButton = (
        <button className="ml-auto" onClick={() => {
            // Do something to save here
        }}>
            <Save className="text-slate-700 hover:text-slate-400"/>
        </button>
    );

    const toolbarItems = [
        { key: "edit", component: editSwitch },
        { key: "routeName", component: pageRoute },
        { key: "saveButton", component: saveButton },
    ];

    return (
        <div className="flex-1 flex flex-col gap-2.5">
            <Toolbar items={toolbarItems} />
            {isLoading ? (
                ""
            ) : (
                <div
                    className={`${isEdit ? "flex" : "border-2 border-slate-300 rounded-md"} flex-1 box-border puckContainer ${
                        isEdit ? "overflow-hidden" : "overflow-auto"
                    }`}
                >
                    {isEdit ? (
                        // https://puckeditor.com/docs/extending-puck/custom-interfaces
                        <Puck
                            config={config}
                            data={tempData}
                            headerPath={tempData?.route}
                            onChange={(data) => {
                                if (data.content.length === 0) return;

                                setTempData(data);
                            }}
                            onPublish={async (data: Data) => {
                                localStorage.setItem(key, JSON.stringify(data));
                            }}
                            key={tempData?.id}
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
                    ) : (
                        <div className="flex-1 overflow-auto">
                            <div className="w-full h-full overflow-auto">
                                <Render config={config} data={tempData ?? "Error"} />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

interface ToolbarProps {
    items: ToolbarItemProps[];
}

interface ToolbarItemProps {
    key: string;
    component: any;
}

function Toolbar({ items }: ToolbarProps) {
    return (
        <div className="w-full border-2 border-slate-300 rounded-md h-14 flex gap-5 items-center px-5 box-border">
            {items.map((item) => (
                <div className="toolbar-item" key={item.key}>
                    {item.component}
                </div>
            ))}
        </div>
    );
}

function SwitchGroup({ isOn, handleToggle, disabled }: { isOn: boolean; handleToggle: any; disabled?: boolean }) {
    return (
        <>
            <Label htmlFor="toggle-preview">Preview</Label>
            <Switch id="toggle-preview" checked={!isOn} onCheckedChange={() => handleToggle()} disabled={disabled} />
        </>
    );
}
