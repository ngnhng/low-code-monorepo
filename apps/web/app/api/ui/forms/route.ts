const mockData = {
    "/": {
        content: [
            {
                props: {
                    id: "Form-18aec31e-a9e1-426c-9197-682c003bb095",
                    inputs: [
                        {
                            label: "Label",
                            type: "string",
                            id: {
                                value: "FFE3",
                            },
                        },
                    ],
                    workflowId: "workflowID",
                },
                type: "Form",
            },
        ],
        root: { props: { title: "Test" } },
        zones: {},
    },
    "/pricing": {
        content: [],
        root: { props: { title: "Pricing" } },
    },
    "/about": {
        content: [],
        root: { props: { title: "About" } },
    },
};

export async function GET() {
    const obj = {};

    for (const route of Object.keys(mockData)) {
        const formsList = mockData[route].content.filter((element) => element.type === "Form");
        if (formsList.length === 0) continue;
        obj[route] = formsList;
    }

    return Response.json(obj);
}

export async function POST(req: Request) {
    const { json } = req;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { route, formId, workflowId } = await json();

    try {
        // Do something to edit DB here
        return new Response(`Successfully set workflow ID ${workflowId} for form ID ${formId}`, {
            status: 200
        })
    } catch {
        return new Response(`Cannot set workflow ID ${workflowId} for form ID ${formId}`, {
            status: 500
        })
    }
}