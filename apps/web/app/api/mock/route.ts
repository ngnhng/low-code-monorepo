
export async function GET(request: Request) {
   return new Response(JSON.stringify({ message: "Hello World" }), {
      headers: { "content-type": "application/json" },
   });
}
