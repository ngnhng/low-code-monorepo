import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";

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

const dataNested = {
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

      {
         key: "address",
         label: "Address",
         type: "text",
         children: [
            {
               key: "street",
               label: "Street",
               type: "text",
            },

            {
               key: "city",
               label: "City",
               type: "text",
            },

            {
               key: "state",
               label: "State",
               type: "text",
            },
         ],
      },
   ],

   rows: [
      {
         id: 1,
         name: "John Doe",
         age: 25,
         address: {
            street: "123 Main St",
            city: "New York",
            state: "NY",
         },
      },

      {
         id: 2,
         name: "Jane Doe",
         age: 30,
         address: {
            street: "456 Main St",
            city: "New York",
            state: "NY",
         },
      },
   ],
};

export async function GET(request: Request) {
   const url = new URL(request.url ?? "");
   const params = url.searchParams;

   const { pathname } = url;
   console.log("pathname", pathname, params);
   if (!pathname) {
      return NextResponse.json(
         { status: "error", message: "Missing path" },
         { status: 400 }
      );
   }

   if (pathname === "/api/data") {
      if (params.get("e")) {
         return NextResponse.json(dataNested);
      }
      return NextResponse.json(data);
   }

   return NextResponse.json(
      { status: "error", message: "Invalid path" },
      { status: 400 }
   );
}

export async function POST(request: Request) {
   const payload = await request.json();

   // Purge Next.js cache
   revalidatePath(payload.path);

   return NextResponse.json({ status: "ok" });
}
