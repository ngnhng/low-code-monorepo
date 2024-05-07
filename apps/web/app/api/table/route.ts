export function GET() {
    return Response.json([
        {
            label: "Col 1",
            type: "string",
            id: "123"
        },
        {
            label: "Col 2",
            type: "number",
            id: "456"
        },
        {
            label: "Col 3",
            type: "boolean",
            id: "789"
        },
        {
            label: "Col 4",
            type: "date",
            id: "111"
        },
        {
            label: "Col 5",
            type: "time",
            id: "222"
        },
    ])
}