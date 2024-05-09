/* eslint-disable unicorn/no-nested-ternary */
"use client";

import Title from "components/title/title";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button } from "@repo/ui";
import useSWR from "swr";
import { Trash2 } from "lucide-react";
import Link from "next/link";

export default function Page({ params }: { params: { projectId: string } }) {
    const { data, isLoading, error } = useSWR("/api/ui", async (url) => {
        const res = await fetch(url);

        if (!res.ok) {
            const mes = await res.json();
            throw new Error(mes.error);
        }

        return await res.json();
    });

    // const createNewPage = async () => {
    //     // Do Something
    // }

    return (
        <div className="w-full h-full rounded-md border-2 border-slate-300 p-[30px] flex flex-col gap-5">
            <Title name="UI Builder" description="Think fast!" />
            <div className="w-full h-[1px] bg-slate-300"></div>
            <Button className="w-full">Create new page</Button>
            <div className="w-full rounded-md border-2 border-slate-300 p-5">
                {isLoading ? (
                    "Loading..."
                ) : error ? (
                    error.message
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Route</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((routeData) => {
                                return (
                                    <TableRow className="hover:bg-slate-100 p-0" key={routeData.id}>
                                        <TableCell className="font-medium w-full relative">
                                            <Link href={`/${params.projectId}/edit/${routeData.id}`} className="w-full hover:cursor-pointer">
                                                <div className="w-full p-5">{routeData.route}</div>
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <button className="p-2.5 rounded-md hover:text-red-500">
                                                <Trash2 />
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
