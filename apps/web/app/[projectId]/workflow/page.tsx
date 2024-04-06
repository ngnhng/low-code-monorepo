"use client";

import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import "@bpmn-io/properties-panel/assets/properties-panel.css";

import React, { useEffect, useRef, FC, useState } from "react";

import { useMobxStore } from "lib/mobx/store-provider";
import { observer } from "mobx-react-lite";
import PropertiesPanel from "./_components/modeler-panel";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
    ScrollArea,
    Button,
} from "@repo/ui";
import { PlayIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";
import useSWR from "swr";

export default function Page() {
    const {
        workflow: { setCurrentWorkflow, launchWorkflow, fetchWorkflow },
    } = useMobxStore();

    const {
        data: xml,
        isLoading,
        error,
    } = useSWR("workflow", () => {
        return fetchWorkflow("default").then(([data, ok]) => {
            if (ok) {
				console.log(data);
                return data;
            } else {
                throw new Error("Failed to fetch workflow");
            }
        });
    });

    useEffect(() => {
        if (xml) {
            setCurrentWorkflow(xml);
        }
    }, [xml]);

    if (isLoading || error) return <div>Loading...</div>;

    const handleLaunchWorkflow = async () => {
        const ok = await launchWorkflow();
        if (!ok) {
            toast.error("Failed to launch workflow");
        }
        toast.success("Workflow launched successfully");
    };

    return (
        <div className="flex-1 flex flex-col gap-2.5 overflow-hidden">
            <div className="w-full border-2 border-slate-300 rounded-md flex gap-2.5 items-center justify-between p-2 box-border">
                <Button className="flex gap-2.5" onClick={handleLaunchWorkflow}>
                    <PlayIcon /> Execute Workflow
                </Button>
                <div className="font-medium p-2">
                    {/* Showing current node of workflow */}
                    Workflow Status:{" "}
                    <span className="text-green-500 font-bold">
                        Activity_Test
                    </span>
                </div>
            </div>
            <Modeler />
        </div>
    );
}

const Modeler = observer(() => {
    const {
        workflow: { currentWorkflow, newRenderer, modeler, setModeler },
    } = useMobxStore();

    const containerRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    // eslint-disable-next-line unicorn/no-null
    //  const [modeler, setModeler] = useState(null);

    useEffect(() => {
        const initializeModeler = async () => {
            if (containerRef.current) {
                const modeler = await newRenderer({
                    container: containerRef.current,
                    //  propertiesPanel: {
                    //    parent: sidebarRef.current,
                    //  },
                    keyboard: {
                        bindTo: document,
                    },
                });
                await modeler.importXML(currentWorkflow);

                setModeler(modeler);
            }
        };

        initializeModeler();
    }, [currentWorkflow]);

    if (!currentWorkflow) {
        return <div>Loading Modeler...</div>;
    }

    return (
        <div className="flex-1 flex overflow-hidden">
            <ResizablePanelGroup
                direction="horizontal"
                className="h-full rounded-md border"
            >
                <ResizablePanel defaultSize={50}>
                    <div className="h-full max-w-full">
                        <div ref={containerRef} className="h-full"></div>
                    </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50}>
                    <ResizablePanelGroup direction="vertical">
                        <ResizablePanel defaultSize={35}>
                            <ScrollArea className="h-[calc(100%)]">
                                {/*<div ref={sidebarRef} className="bg-gray-200 h-full"></div>*/}
                                <div className="h-full">
                                    {modeler !== null && (
                                        <DebugXML modeler={modeler} />
                                    )}
                                </div>
                            </ScrollArea>
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={65}>
                            <ScrollArea className="h-[calc(100%)]">
                                <div className="h-full">
                                    {modeler !== null && (
                                        <PropertiesPanel
                                            modeler={modeler}
                                            container={panelRef}
                                        />
                                    )}
                                </div>
                            </ScrollArea>
                        </ResizablePanel>
                        {/*<ResizableHandle withHandle />
              <ResizablePanel defaultSize={25} className="overflow-auto">
                <div>{modeler !== null && <DebugXML modeler={modeler} />}</div>
              </ResizablePanel>*/}
                    </ResizablePanelGroup>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
});

const DebugXML: FC<{ modeler: any }> = ({ modeler }) => {
    const [xml, setXml] = useState("");
    useEffect(() => {
        const update = () => {
            modeler.saveXML({ format: true }).then(({ xml }) => {
                setXml(xml);
            });
        };
        modeler.on("commandStack.changed", update);

        return () => {
            modeler.off("commandStack.changed", update);
        };
    }, [modeler]);

    return (
        <div className="overflow-auto p-5">
            <pre className="w-full whitespace-pre-wrap">{xml}</pre>
        </div>
    );
};
