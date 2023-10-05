"use client";

import "./style.css";

import { Config, Data } from "@measured/puck";
import { Puck } from "@measured/puck";
import { useEffect, useState } from "react";
// import headingAnalyzer from "@measured/puck-plugin-heading-analyzer/src/HeadingAnalyzer";
import config, { initialData } from "../../../config";

const isBrowser = typeof window !== "undefined";

export default function Page({ params }: { params: { "project-id": string } }) {
    const path = "/";
    const componentKey = Buffer.from(Object.keys(config.components).join("-")).toString("base64");
    const key = `puck-demo:${componentKey}:${path}`;

    const [data] = useState<Data>(() => {
        if (isBrowser) {
            const dataStr = localStorage.getItem(key);

            if (dataStr) {
                return JSON.parse(dataStr);
            }

            return initialData[path] || undefined;
        }
    });

    return (
        <div className="editor">
            <div className="toolbar">
                Toolbar Placeholder
            </div>
            <div className="puckContainer">
                <Puck
                    config={config as Config}
                    data={data}
                    onPublish={async (data: Data) => {
                        localStorage.setItem(key, JSON.stringify(data));
                    }}
                    headerPath={path}
                />
            </div>
        </div>
    );
}
