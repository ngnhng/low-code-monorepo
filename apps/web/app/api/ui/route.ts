const routes = [
    {
        route: "/",
        id: "199299193"
    },
    {
        route: "/pricing",
        id: "193810394"
    },
    {
        route: "/about",
        id: "188388747"
    }
]

export async function GET() {
    return Response.json(routes);
}