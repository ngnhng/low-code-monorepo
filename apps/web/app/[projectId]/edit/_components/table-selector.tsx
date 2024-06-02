import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@repo/ui";
import { useMobxStore } from "../../../../lib/mobx/store-provider";
import useSWR from "swr";
import { observer } from "mobx-react-lite";

export const TableSelector = observer(
    ({ onChange, value }: { onChange: any; value: any }) => {
        const {
            projectData: { currentProjectId },
            tableData: { fetchTables },
        } = useMobxStore();

        const {
            data: list,
            isLoading,
            error,
        } = useSWR(["tables", currentProjectId], () => fetchTables());

        const handleSelect = (tableId: string) => {
            console.log("Table Selected", tableId);
            const columnNames = list
                ?.find((table) => table.id === tableId)
                ?.columns.map((column) => column.name)
                .filter((column) => column !== "id");

            console.log("Columns", columnNames);

            onChange({
                ...value,
                tableId: tableId,
                enabledFields: columnNames,
            });
        };

        if (isLoading || !list) {
            return <div>Loading...</div>;
        }

        if (error) {
            return <div>Error</div>;
        }

        return (
            <div>
                <Select
                    onValueChange={(value) => handleSelect(value)}
                    defaultValue={value?.tableId ?? undefined}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select a table" />
                    </SelectTrigger>
                    <SelectContent>
                        {list?.map((table) => (
                            <SelectItem value={table.id} key={table.id}>
                                {table.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );
    }
);
