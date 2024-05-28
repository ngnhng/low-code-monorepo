"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui";
import React from "react";
import { TextWithIcon } from "../../../../components/text/text-with-icon";
import { Table } from "react-feather";
import { useMobxStore } from "../../../../lib/mobx/store-provider";
import useSWR from "swr";

export default function Layout({
    fields,
    view,
    params,
}: {
    fields: React.ReactNode;
    view: React.ReactNode;
    params: { tableId: string };
}) {
    const {
        projectData: { currentProjectId },
        tableData: { fetchTables },
    } = useMobxStore();

    const { data: tables, isLoading } = useSWR<any>(
        ["tables", currentProjectId],
        () => fetchTables()
    );
    return (
        <div className="h-full flex-1">
            <Tabs defaultValue="view">
                <TabsList className="flex justify-between w-full px-4">
                    <TextWithIcon icon={<Table />}>
                        {isLoading
                            ? "Loading..."
                            : tables?.find(
                                  (table) => table.id === params.tableId
                              )?.label}
                    </TextWithIcon>

                    <div className="flex justify-center w-full">
                        <TabsTrigger value="view">View</TabsTrigger>
                        <TabsTrigger value="fields">Fields</TabsTrigger>
                    </div>
                </TabsList>
                <TabsContent value="view">
                    <div className="h-full">{view}</div>
                </TabsContent>
                <TabsContent value="fields">{fields}</TabsContent>
            </Tabs>
        </div>
    );
}
