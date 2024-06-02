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

export type ValueAccept = {
  tableId: string;
  selectedTableFields: string[];
};

export const TableSelectorV2 = observer(
  ({ onChange, value }: { onChange: any; value: any }) => {
    const {
      projectData: { currentProjectId },
      tableData: { fetchTables, tables },
    } = useMobxStore();

    const {
      data: list,
      isLoading,
      error,
    } = useSWR(["tables", currentProjectId], () => fetchTables(), {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    });

    const handleSelect = (v: string) => {
      console.log("Table Selected", value);

      const selectedTableFields =
        tables
          .find((table) => table.id === v)
          ?.columns.filter((col) => col.type !== "link") ?? [];

      onChange({
        ...value,
        tableId: v,
        selectedTableFields: selectedTableFields,
        yAxis: [],
        visibleColumns: [],
        xAxis: "",
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
