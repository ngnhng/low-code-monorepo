// POST /api/mock/[project-id]/data/[table-id]/rows

export async function POST() {
   return new Response(
      JSON.stringify({
         success: true,
         message: "Row created successfully",
         row: {
            id: "1",
            created_at: "2021-05-31T11:18:03.000Z",
            updated_at: "2021-05-31T11:18:03.000Z",
            values: {
               Name: "John Doe",
               Email: "test@gmail.com",
               Phone: "1234567890",
               Address: "Test Address",
               City: "Test City",
               State: "Test State",
            },
         },
      }),
      {
         headers: {
            "content-type": "application/json; charset=UTF-8",
         },
      }
   );
}
