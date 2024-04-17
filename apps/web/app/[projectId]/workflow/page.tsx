"use client";

import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import "@bpmn-io/properties-panel/assets/properties-panel.css";

import React, { useEffect, useRef, useState } from "react";

import { useMobxStore } from "lib/mobx/store-provider";
import { observer } from "mobx-react-lite";
import PropertiesPanel from "./_components/modeler-panel";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
    ScrollArea,
    Button,
    Popover,
    PopoverTrigger,
    PopoverContent,
    Command,
    CommandInput,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from "@repo/ui";
import { PlayIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";
import useSWR from "swr";
import { Check } from "lucide-react";
import { cn } from "../../../lib/shadcn/utils";

export default function Page() {
    return (
        <div className="flex-1 flex flex-col gap-2.5 overflow-hidden">
            <Controls />
            <Modeler />
        </div>
    );
}

const Modeler = observer(() => {
    const {
        workflow: {
            workflowName,
            currentWorkflow,
            fetchWorkflow,
            newRenderer,
            modeler,
        },
    } = useMobxStore();

    console.log("Modeler component rendered", workflowName);

    const { isLoading, error, mutate } = useSWR("workflow", () =>
        fetchWorkflow()
    );

    const containerRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let isCancelled = false;

        const initializeModeler = async () => {
            console.log("initializeModeler", currentWorkflow);
            if (containerRef.current && currentWorkflow && !isCancelled) {
                await newRenderer({
                    container: containerRef.current,
                    keyboard: {
                        bindTo: document,
                    },
                });
            }
        };

        const timeoutId = setTimeout(initializeModeler, 0);

        return () => {
            isCancelled = true;
            clearTimeout(timeoutId);
        };
    }, [containerRef, currentWorkflow]);

    useEffect(() => {
        mutate();
    }, [workflowName]);

	useEffect(() => {
		if (modeler && currentWorkflow) {
			modeler.importXML(currentWorkflow);
		}
	}, [modeler, currentWorkflow]);

    if (isLoading || error || !currentWorkflow) {
        return <div>Loading Modeler...</div>;
    }

    return (
        <div className="flex-1 flex overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className="h-full rounded-md border">
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
                                    {modeler !== null && <DebugXML />}
                                </div>
                            </ScrollArea>
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={65}>
                            <ScrollArea className="h-[calc(100%)]">
                                <div className="h-full">
                                    {modeler !== null && (
                                        <PropertiesPanel container={panelRef} />
                                    )}
                                </div>
                            </ScrollArea>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
});

const DebugXML = observer(() => {
    const {
        workflow: { modeler },
    } = useMobxStore();

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
    }, []);

    return (
        <div className="overflow-auto p-5">
            <pre className="w-full whitespace-pre-wrap">{xml}</pre>
        </div>
    );
});

const Controls = observer(() => {
    const {
        workflow: { launchWorkflow },
    } = useMobxStore();

    const handleLaunchWorkflow = async () => {
        const [result, ok] = await launchWorkflow();
        ok ? toast.success("Workflow launched successfully: " + result) : toast.error("Failed to launch workflow: " + result);
        ok ? toast.success("Workflow launched successfully: " + result) : toast.error("Failed to launch workflow: " + result);
    };

    return (
        <div className="w-full border-2 border-slate-300 rounded-md flex gap-2.5 items-center justify-between p-2 box-border">
            <Button className="flex gap-2.5" onClick={handleLaunchWorkflow}>
                <PlayIcon /> Execute Workflow
            </Button>
            <div className="flex flex-row items-center gap-x-4">
                <WorkflowSelector />

                <div className="font-medium p-2">
                    {/* Showing current node of workflow */}
                    Workflow Status: <span className="text-green-500 font-bold">Activity_Test</span>
                    Workflow Status: <span className="text-green-500 font-bold">Activity_Test</span>
                </div>
            </div>
        </div>
    );
});

const WorkflowSelector = observer(() => {
    const [open, setOpen] = useState(false);

    const {
        workflow: {
            workflowName,
            workflowNameList,
            setWorkflowName,
            fetchWorkflowNameList,
        },
    } = useMobxStore();

    const { isLoading, error } = useSWR("workflow-selector", () =>
        fetchWorkflowNameList()
    );

    if (isLoading || error) {
        return <>Loading</>;
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    {workflowNameList ? workflowName : "Select a workflow"}
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                <Command>
                    <CommandInput placeholder="Select Workflow" />
                    <CommandEmpty> No workflow found</CommandEmpty>
                    <CommandGroup>
                        {[...workflowNameList].map((name) => (
                            <CommandItem
                                key={name}
                                value={name}
                                onSelect={(val) => {
                                    setWorkflowName(val);
                                    setOpen(false);
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        workflowName === name
                                            ? "opacity-100"
                                            : "opacity-0"
                                    )}
                                />
                                {name}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
});
