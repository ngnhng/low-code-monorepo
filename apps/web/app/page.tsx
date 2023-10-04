"use client";

import { Config, Data, Puck } from "@measured/puck";

const initialData = {
    content: [],
    root: {
        title: "dwd",
    },
};

const path = "apps/web/app/page.tsx";

type Props = {
    HeadingBlock: { title: string };
};

const config: Config<Props> = {
    components: {
        HeadingBlock: {
            fields: {
                title: { type: "text" },
            },
            defaultProps: {
                title: "Heading",
            },
            render: ({ title }) => (
                <div style={{ padding: 64 }}>
                    <h1>{title}</h1>
                </div>
            ),
        },
    },
};

function Editor() {
    return (
        <Puck
            config={config}
            data={initialData}
            onPublish={async (data: Data) => {
                await fetch("/api/puck", {
                    method: "post",
                    body: JSON.stringify({ data, path }),
                });
            }}
        />
    );
}

export default function Page() {
    return (
        <div>
            <Editor />
        </div>
    );
}
