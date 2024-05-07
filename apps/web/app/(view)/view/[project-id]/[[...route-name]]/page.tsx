/* eslint-disable unicorn/no-nested-ternary */
"use client";

import "@measured/puck/puck.css";

import useSWR from "swr";
import { Render } from "@measured/puck";

import config from "../../../../[projectId]/edit/_config"

const fetcher = async (key: string) => {
    const res = await fetch(key);

    if (!res.ok) {
        return new Error("Something has gone wrong?");
    }

    return await res.json();
};

export default function Page({ params }: { params: { "project-id": string, "route-name": string[] } }) {
    const route = params["route-name"] ? params["route-name"].join("") : "";


    const { data, isLoading, error } = useSWR("/api/ui", fetcher);

    return (
        <div className="flex-1 overflow-auto">
            <div className="w-full h-full overflow-auto">
                {isLoading ? (
                    "Loading..."
                ) : error ? (
                    error.message
                ) : data[`/${route}`] ? (
                    <Render config={config} data={data[`/${route}`]} />
                ) : (
                    "Not found"
                )}
            </div>
        </div>
    );
}
