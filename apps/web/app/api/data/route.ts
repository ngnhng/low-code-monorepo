import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import fs from "fs";

const data = {
   columns: [
      {
         key: "name",
         label: "Name",
         type: "text",
      },

      {
         key: "age",
         label: "Age",
         type: "number",
      },
   ],

   rows: [
      {
         id: 1,
         name: "John Doe",
         age: 25,
      },

      {
         id: 2,
         name: "Jane Doe",
         age: 30,
      },
   ],
};

export async function GET(request: Request) {
   const { pathname } = new URL(request.url);

   if (pathname === "/api/data") {
      return NextResponse.json(data);
   }

   return NextResponse.next();
}

export async function POST(request: Request) {
   const payload = await request.json();

   // Purge Next.js cache
   revalidatePath(payload.path);

   return NextResponse.json({ status: "ok" });
}
