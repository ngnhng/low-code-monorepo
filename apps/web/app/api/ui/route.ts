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
                        {
                            label: "Date",
                            type: "date",
                            id: {
                                value: "AshallahMasshallah"
                            }
                        },
                        {
                            label: "Time",
                            type: "time",
                            id: {
                                value: "MohammedAfizRafiz"
                            }
                        }
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
                    workflowId: ""
                },
                type: "FormTable"
            }
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
    return Response.json(mockData);
}