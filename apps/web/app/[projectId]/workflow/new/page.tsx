"use client";

import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import "@bpmn-io/properties-panel/assets/properties-panel.css";
import "bpmn-js-bpmnlint/dist/assets/css/bpmn-js-bpmnlint.css";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

import { useMobxStore } from "lib/mobx/store-provider";
import { observer } from "mobx-react-lite";
import PropertiesPanel from "../_components/modeler-panel";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
    ScrollArea,
    Button,
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogFooter,
    Input,
    Label,
    DialogClose,
} from "@repo/ui";
import { PlayIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";
import useSWR from "swr";
import { Save } from "react-feather";
import { useRouter } from "next/navigation";

export default function Page() {
    //const { workflowId } = params;

    //const {
    //    workflow: { setWorkflowId },
    //} = useMobxStore();

    //useEffect(() => {
    //    setWorkflowId(workflowId);
    //}, [workflowId]);

    return (
        <div className="flex-1 flex flex-col gap-2.5 overflow-hidden">
            <Controls />
            <Modeler />
        </div>
    );
}

const Modeler = observer(() => {
    const {
        workflow: { modeler, fetchDefaultWorkflow, newRenderer },
    } = useMobxStore();

    //const { workflowId } = props;

    const {
        data: currentWorkflow,
        isLoading,
        error,
    } = useSWR(["workflow", "default"], () => fetchDefaultWorkflow());

    const panelRef = useRef<HTMLDivElement>(null);

    // this useEffect is used to initialize the modeler
    useEffect(() => {
        const initializeModeler = async () => {
            if (currentWorkflow) {
                console.log("[MODELER] creating new modeler");

                // create new modeler
                // ref will be attached to the container later
                await newRenderer({
                    //container: containerRef.current,
                    keyboard: {
                        bindTo: document,
                    },
                });
            }
        };

        initializeModeler();

        // return () => {
        //     modeler?.destroy();
        // };
    }, [currentWorkflow]);

    if (isLoading || error || !currentWorkflow) {
        return <div>Loading Modeler...</div>;
    }

    return (
        <div className="flex-1 flex overflow-hidden">
            <ResizablePanelGroup
                direction="horizontal"
                className="h-full rounded-md border"
            >
                <ResizablePanel defaultSize={60}>
                    <div className="h-full max-w-full">
                        {modeler && currentWorkflow && (
                            <BPMNModeler
                                modeler={modeler}
                                currentWorkflow={currentWorkflow}
                            />
                        )}
                    </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={40}>
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
        workflow: { launchWorkflow, saveWorkflow },
    } = useMobxStore();

    const router = useRouter();

    const [newTitle, setNewTitle] = useState("Workflow Title");

    const handleLaunchWorkflow = async () => {
        const [result, ok] = await launchWorkflow();
        ok
            ? toast.success("Workflow launched successfully: " + result)
            : toast.error("Failed to launch workflow: " + result);
    };

    const handleSaveWorkflow = async () => {
        await saveWorkflow(newTitle)
            .then((res) => {
                console.log("res", res);
                router.replace(`${res.wid}`);
                toast.success("Workflow saved successfull");
            })
            .catch((error) => {
                toast.error("Failed to save workflow: " + error);
            });
    };

    return (
        <div className="w-full border-2 border-slate-300 rounded-md flex gap-2.5 items-center justify-between p-2 box-border">
            <div className="flex items-center px-4 gap-4">
                <Button className="flex gap-2.5" onClick={handleLaunchWorkflow}>
                    <PlayIcon /> Execute Workflow
                </Button>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="flex gap-2.5">
                            <Save />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <div className="flex flex-col gap-4 p-4">
                            <Label>Enter Workflow Title</Label>
                            <Input
                                type="text"
                                placeholder="Workflow Title"
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button
                                    onClick={() => {
                                        handleSaveWorkflow();
                                    }}
                                >
                                    Save
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="flex flex-row items-center gap-x-4">
                {/*<WorkflowSelector />*/}

                <div className="font-medium p-2">
                    {/* Showing current node of workflow */}
                    Workflow Status:{" "}
                    <span className="text-green-500 font-bold">
                        Activity_Test
                    </span>
                </div>
            </div>
        </div>
    );
});

const BPMNModeler = observer(
    ({ modeler, currentWorkflow }: { modeler: any; currentWorkflow: any }) => {
        const containerRef = useRef<HTMLDivElement>(null);

        useLayoutEffect(() => {
            if (!containerRef.current) return;

            // If you can read this, don't read further
            //setTimeout(() => {
            // eslint-disable-next-line unicorn/consistent-function-scoping
            const attachModeler = async () => {
                console.log("BPMNModeler", containerRef.current);

                try {
                    modeler.attachTo(containerRef.current);

                    const { warnings } =
                        await modeler.importXML(currentWorkflow);
                    if (warnings.length > 0) {
                        console.log("importXML", warnings);
                    }
                    modeler.get("canvas").zoom("fit-viewport");
                } catch (error) {
                    console.error(error);
                }
            };

            attachModeler();
            //}, 1000);

            return () => {
                modeler?.clear();
                modeler?.detach();
            };
        }, [containerRef.current]);

        return <div ref={containerRef} className="h-full"></div>;
    }
);
