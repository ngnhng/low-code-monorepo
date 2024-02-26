// POST /api/mock/[projectId]/data/[tableId]/columns :add new column

import fs from "node:fs/promises";
import path from "node:path";
// body: { column: {
//   key: string,
//   label: string,
//   type: string,
//   role?: string,
// } }
export async function POST(request: Request) {
   const databasePath = path.join(
      process.cwd(),
      "app/api/mock/[projectId]/data/[tableId]/database.json"
   );

   const database = await fs.readFile(databasePath, "utf8");

//   const url = new URL(request.url);

//   const projectId = url.pathname.split("/")[3];
//   const tableId = url.pathname.split("/")[5];

   const requestBody = await request.json();

   console.log(requestBody);

   if (!requestBody.key || !requestBody.label || !requestBody.type) {
      return new Response(undefined, {
         status: 400,
      });
   }

   const column = {
      key: requestBody.key,
      label: requestBody.label,
      type: requestBody.type,
      role: requestBody.role,
   };

   const tableData = JSON.parse(database);

   tableData.columns.push(column);

   await fs.writeFile(databasePath, JSON.stringify(tableData));

   return new Response(undefined, {
      status: 200,
   });
}

// DELETE /api/mock/[projectId]/data/[tableId]/columns :delete column
// body: { columnId: string }
export async function DELETE(request: Request) {
   const databasePath = path.join(
      process.cwd(),
      "app/api/mock/[projectId]/data/[tableId]/database.json"
   );

//   const url = new URL(request.url);

//   const projectId = url.pathname.split("/")[3];
//   const tableId = url.pathname.split("/")[5];

   const requestBody = await request.json();

   const columnId = requestBody.columnId;

   const tableData = JSON.parse(await fs.readFile(databasePath, "utf8"));

   const searchResult = tableData.columns.filter((column) => {
      return column.key !== columnId;
   });

   if (searchResult.length === tableData.columns.length) {
      return new Response(undefined, {
         status: 400,
      });
   }

   tableData.columns = searchResult;

   await fs.writeFile(databasePath, JSON.stringify(tableData));

   return new Response(undefined, {
      status: 200,
   });
}

// PUT /api/mock/[projectId]/data/[tableId]/columns :update column
// body: { column: {} }
export async function PUT(request: Request) {
   const databasePath = path.join(
      process.cwd(),
      "app/api/mock/[projectId]/data/[tableId]/database.json"
   );

//   const url = new URL(request.url);

//   const projectId = url.pathname.split("/")[3];
//   const tableId = url.pathname.split("/")[5];

   const requestBody = await request.json();

   const column = requestBody.column;

   const tableData = JSON.parse(await fs.readFile(databasePath, "utf8"));

   tableData.columns = tableData.columns.map((c) => {
      return c.key === column.key ? column : c;
   });

   await fs.writeFile(databasePath, JSON.stringify(tableData));

   return new Response(undefined, {
      status: 200,
   });
}
