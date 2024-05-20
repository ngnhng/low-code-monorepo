/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, Input } from "@repo/ui";
import { useMobxStore } from "../../../../lib/mobx/store-provider";
import useSWR from "swr";
import { observer } from "mobx-react-lite";
import { Link } from "lucide-react";
import { useRouter } from "next/navigation";

export const WorkflowSelector = observer(
    ({ onChange, value }: { onChange: any; value: any }) => {
        const {
            projectData: { currentProjectId },
            workflow: { fetchWorkflowNameList },
        } = useMobxStore();

        //const [open, setOpen] = useState(false);
        //const [, setWorkflow] = useState<any>();

        const {
            data: list,
            isLoading,
            error,
        } = useSWR(
            ["workflows", currentProjectId],
            () => fetchWorkflowNameList(),
            {
                revalidateOnFocus: false,
                revalidateIfStale: false,
            }
        );

        const router = useRouter();

        //const handleSelect = (value: string) => {
        //    console.log("Workflow Selected", value);
        //    onChange(value);
        //};

        const handleNavigateToWorkflow = (value: string) => {
            console.log("Navigate to workflow", value);
            if (!value) {
                return;
            }
            router.push(`/workflow/${value}`);
        };

        console.log("Workflow Selector Value:", value);

        if (isLoading || !list) {
            return <div>Loading...</div>;
        }

        if (error) {
            return <div>Error</div>;
        }

        return (
            <div className="flex flex-row justify-between">
                <Input disabled value={value} />
                {/*<Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="justify-between w-full"
                        >
                            {value
                                ? [...list].find(
                                      (workflow) => workflow.wid === value
                                  )?.title
                                : "Select a workflow"}
                            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <Command>
                            <CommandInput placeholder="Search workflows" />
                            <CommandEmpty>No workflows found</CommandEmpty>
                            <CommandGroup>
                                {[...list]?.map((workflow) => (
                                    <CommandItem
                                        key={workflow.wid}
                                        value={workflow.wid}
                                        onSelect={() => {
                                            handleSelect(workflow.wid);
                                            setWorkflow(workflow);
                                            setOpen(false);
                                        }}
                                    >
                                        {workflow.title}
                                        <CheckIcon
                                            className={cn(
                                                "ml-auto h-4 w-4",
                                                value === workflow.wid
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </Command>
                    </PopoverContent>
                </Popover>*/}
                <Button
                    variant="outline"
                    className="justify-between"
                    disabled={!value}
                    onClick={() => handleNavigateToWorkflow(value)}
                >
                    <Link className="ml auto h-4 w-4 opacity-50" />
                </Button>
            </div>
        );
    }
);
