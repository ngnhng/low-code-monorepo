const mockData = [
    {
        route: "/",
        id: "199299193",
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
                        {
                            label: "Date",
                            type: "date",
                            id: {
                                value: "AshallahMasshallah",
                            },
                        },
                        {
                            label: "Time",
                            type: "time",
                            id: {
                                value: "MohammedAfizRafiz",
                            },
                        },
                    ],
                    workflowId: "",
                },
                type: "Form",
            },
            {
                props: {
                    id: "Form-18aec31e-a9e1-426c-9197-682c003bb094",
                    tableId: "abcd",
                    formName: "Form Name 123",
                    workflowId: "",
                },
                type: "FormTable",
            },
        ],
        root: { props: { title: "Test" } },
        zones: {},
    },
    {
        route: "/pricing",
        id: "193810394",
        content: [],
        root: { props: { title: "Pricing" } },
    },
    {
        route: "/about",
        id: "188388747",
        content: [],
        root: { props: { title: "About" } },
    },
];

export function GET(req: Request, { params }: { params: { routeId: string } }) {
    const data = mockData.find((route) => route.id === params.routeId);
    if (!data)
        return Response.json(
            {
                error: "Cannot find route",
            },
            {
                status: 404,
            }
        );

    return Response.json(data);
}
