//Mock endpoint for database
// Spec:

// GET /api/mock/{projectId}/data/all: Get all data for a project

const TABLES = [
   {
      id: "1",
      name: "Table 1",
   },
   {
      id: "2",
      name: "Table 2",
   },
];

export async function GET(request: Request) {
   const url = new URL(request.url);
   const projectId = url.pathname.split("/")[3];

   const tables = TABLES;

   return new Response(JSON.stringify(tables), {
      headers: { "content-type": "application/json" },
   });
}
