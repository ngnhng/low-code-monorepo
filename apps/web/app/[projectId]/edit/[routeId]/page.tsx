"use client";

import "../style.css";

import type { Data } from "@measured/puck";
import { Render, Puck } from "@measured/puck";
import "@measured/puck/puck.css";
import { Globe, Save } from "lucide-react";

import { useEffect, useState } from "react";
import config from "../_config";
import { Switch, Label, Input, Button } from "@repo/ui";
import useSWR from "swr";
import { notFound, useRouter } from "next/navigation";
import { useMobxStore } from "../../../../lib/mobx/store-provider";
import {
    getLocalStorage,
    setLocalStorage,
} from "../../../../lib/local-storage";
import { toast } from "sonner";

export default function Page({ params }: { params: { routeId: string } }) {
    //const [tempData, setTempData] = useState<any>();
    const [isEdit, setIsEdit] = useState<boolean>(true);
    const [isLocalStorageSet, setIsLocalStorageSet] = useState(false);

    const {
        projectData: { currentProjectId: projectId, saveView, getProjectById },
    } = useMobxStore();

    const key = `puck.${projectId}.${params.routeId}`;

    const {
        data: project,
        isLoading,
        error,
        mutate,
    } = useSWR<any>(["view", projectId], () => getProjectById(projectId), {
        revalidateOnFocus: false,
        revalidateIfStale: false,
    });

    if (error) {
        notFound();
    }

    const view = project?.views.find(
        (view) => view.uiData.route === `/${params.routeId}`
    );

    useEffect(() => {
        if (!view) return;
        console.log("Reset", view.uiData);
        setLocalStorage(key, view.uiData);
        setIsLocalStorageSet(true);
    }, [params.routeId, view]);
    //setLocalStorage(key, view.uiData);

    const handleToggle = () => {
        setIsEdit(!isEdit);
    };

    const getUi = () => {
        if (isLocalStorageSet) {
            console.log("Get UI", JSON.parse(getLocalStorage(key) ?? ""));
            return getLocalStorage(key)
                ? JSON.parse(getLocalStorage(key) ?? "")
                : undefined;
        }

        return;
    };

    const editSwitch = (
        <SwitchGroup
            handleToggle={handleToggle}
            isOn={isEdit}
            disabled={isLoading}
        />
    );

    const pageRoute = (
        <>
            <Label className="w-auto">Route</Label>
            <Input
                placeholder="Empty route is treated as '/'"
                defaultValue={view?.uiData?.route}
                onBlur={(event) => {
                    // Do Something
                    console.log(event.target?.value);
                }}
            />
        </>
    );

    const saveButton = (
        <button
            className="ml-auto"
            onClick={async () => {
                const payload =
                    JSON.parse(getLocalStorage(key) ?? "") || undefined;
                if (!payload) {
                    toast.error("No data to save");
                    return;
                }
                const modifiedData = {
                    route: view?.uiData?.route,
                    id: view?.uiData?.id,
                    ...payload,
                };

                await saveView(modifiedData, projectId, view.id)
                    .then(() => {
                        toast.success("Saved Successfully");
                        mutate();
                    })
                    .catch(() => {
                        toast.error("Failed to save");
                    });
            }}
        >
            <Save className="text-slate-700 hover:text-slate-400" />
        </button>
    );

    const toolbarItems = [
        { key: "edit", component: editSwitch },
        { key: "routeName", component: pageRoute },
        { key: "saveButton", component: saveButton },
    ];

    const PublishButton = () => {
        // button to redirect to /view/{projectId}/{routeId}
        const router = useRouter();
        return (
            <div>
                <Button
                    variant={"primary"}
                    onClick={() => {
                        router.push(`/view/${projectId}/${params.routeId}`);
                    }}
                    className="ml-auto items-center gap-2"
                >
                    <Globe />
                    Publish
                </Button>
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col gap-2.5">
            <div className="w-full border-2 border-slate-300 rounded-md h-14 flex gap-5 justify-between items-center px-5 box-border">
                        <Toolbar items={toolbarItems} />
                    <PublishButton />
            </div>
            {isLoading ? (
                "Loading..."
            ) : (
                <div
                    className={`${isEdit ? "flex" : "border-2 border-slate-300 rounded-md"} flex-1 box-border puckContainer ${
                        isEdit ? "overflow-hidden" : "overflow-auto"
                    }`}
                >
                    {isEdit ? (
                        <PuckEditor
                            config={config}
                            data={getUi()}
                            headerPath={params.routeId}
                            lcKey={key}
                        />
                    ) : (
                        <RenderPreview config={config} lcKey={key} />
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
        <>
            {items.map((item) => (
                <div className="toolbar-item" key={item.key}>
                    {item.component}
                </div>
            ))}
        </>
    );
}

function SwitchGroup({
    isOn,
    handleToggle,
    disabled,
}: {
    isOn: boolean;
    handleToggle: any;
    disabled?: boolean;
}) {
    return (
        <>
            <Label htmlFor="toggle-preview">Preview</Label>
            <Switch
                id="toggle-preview"
                checked={!isOn}
                onCheckedChange={() => handleToggle()}
                disabled={disabled}
            />
        </>
    );
}

function PuckEditor({ config, data, lcKey, headerPath }) {
    console.log(data);

    if (!data) {
        return <div>Loading...</div>;
    }

    return (
        <Puck
            config={config}
            data={data}
            headerPath={headerPath}
            onChange={(data) => {
                if (data.content.length === 0) return;
                console.log("On Change Data", data);
                //setTempData(data);
                setLocalStorage(lcKey, data);
            }}
            onPublish={async (data: Data) => {
                console.log("On Publish Data", data);
                localStorage.setItem(lcKey, JSON.stringify(data));
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
    );
}

function RenderPreview({ config, lcKey }) {
    const data = JSON.parse(getLocalStorage(lcKey) ?? "{}");
    return (
        <div className="flex-1 overflow-auto">
            <div className="w-full h-full overflow-auto">
                <Render config={config} data={data} />
            </div>
        </div>
    );
}
