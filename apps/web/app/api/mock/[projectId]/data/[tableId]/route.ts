import fs from "fs/promises";
import path from "path";

export async function GET(request: Request) {
   const databasePath = path.join(
      process.cwd(),
      "app/api/mock/[projectId]/data/[tableId]/database.json"
   );
   try {
      const database = await fs.readFile(databasePath, "utf-8");
      return new Response(database, {
         headers: { "content-type": "application/json" },
      });
   } catch (err) {
      return new Response(undefined, {
         status: 404,
      });
   }
}
