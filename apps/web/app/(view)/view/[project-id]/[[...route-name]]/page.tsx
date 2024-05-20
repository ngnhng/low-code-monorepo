/* eslint-disable unicorn/no-nested-ternary */
"use client";

import "@measured/puck/puck.css";

import useSWR from "swr";
import { Render } from "@measured/puck";

import config from "../../../../[projectId]/edit/_config";
import { useMobxStore } from "../../../../../lib/mobx/store-provider";

export default function Page({
    params,
}: {
    params: { "project-id": string; "route-name": string[] };
}) {
    const route = params["route-name"] ? params["route-name"].join("") : "";
    const projectId = params["project-id"];

    const {
        projectData: { getProjectById, setCurrentProjectId },
    } = useMobxStore();

    //const key = `puck.${projectId}.${route}`;
    if (projectId) {
        setCurrentProjectId(projectId);
    }

    const { data: project, isLoading } = useSWR<any>(
        ["view", projectId],
        () => getProjectById(projectId),
        {
            revalidateOnFocus: false,
            revalidateIfStale: false,
        }
    );

    //console.log("projects", projects)

    //const project = projects?.find(
    //    (project) => project.pid === projectId
    //);

    console.log("project", project);

    const view = project?.views?.find(
        (view) => view.uiData.route === `/${route}`
    );

    //const { data, isLoading, error } = useSWR("/api/ui", async (url) => {
    //    const res = await fetch(url);

    //    if (!res.ok) {
    //        throw new Error("Something has gone wrong?");
    //    }

    //    const allRoutes = await res.json();
    //    const routeData = allRoutes.find(({ route: routeName }) => routeName === `/${route}`);

    //    if (!routeData) {
    //        throw new Error("This page does not exist!");
    //    }
    //    console.log("yello")
    //    const routeRes = await fetch(`/api/ui/${routeData.id}`);

    //    if (!routeRes.ok) {
    //        throw new Error("Failed to fetch route");
    //    }

    //    return await routeRes.json();
    //});

    if (!view) {
        return <div>Not found</div>;
    }

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex-1 overflow-auto">
            <div className="w-full h-full overflow-auto">
                <Render config={config} data={view.uiData} />
            </div>
        </div>
    );
}
