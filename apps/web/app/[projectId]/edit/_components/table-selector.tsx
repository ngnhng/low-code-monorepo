/* eslint-disable @typescript-eslint/no-unused-vars */
import { Select } from "@repo/ui";
import { useMobxStore } from "../../../../lib/mobx/store-provider";
import useSWR from "swr";

export const TableSelector = () => {
    const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        projectData: { currentProjectId, fetchProjectList },
    } = useMobxStore();

    const { data, isLoading } = useSWR(["projects", currentProjectId], () =>
        fetchProjectList()
    );

    return (
        <div>
            <Select></Select>
        </div>
    );
};
