/* eslint-disable unicorn/no-nested-ternary */
"use client";

import "@measured/puck/puck.css";

import useSWR from "swr";
import { Render } from "@measured/puck";

import config from "../../../../[projectId]/edit/_config"

export default function Page({ params }: { params: { "project-id": string, "route-name": string[] } }) {
    const route = params["route-name"] ? params["route-name"].join("") : "";

    const { data, isLoading, error } = useSWR("/api/ui", async (url) => {
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error("Something has gone wrong?");
        }
        
        const allRoutes = await res.json();
        const routeData = allRoutes.find(({ route: routeName }) => routeName === `/${route}`);

        if (!routeData) {
            throw new Error("This page does not exist!");
        }
        console.log("yello")
        const routeRes = await fetch(`/api/ui/${routeData.id}`);

        if (!routeRes.ok) {
            throw new Error("Failed to fetch route");
        }

        return await routeRes.json();
    });

    return (
        <div className="flex-1 overflow-auto">
            <div className="w-full h-full overflow-auto">
                {isLoading ? (
                    "Loading..."
                ) : error ? (
                    error.message
                ) : data ? (
                    <Render config={config} data={data} />
                ) : (
                    "Not found"
                )}
            </div>
        </div>
    );
}
