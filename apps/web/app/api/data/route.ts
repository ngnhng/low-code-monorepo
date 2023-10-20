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
         key: "username",
         label: "Username",
         type: "text",
      },
      {
         key: "email",
         label: "Email",
         type: "text",
      },
      {
         key: "phone",
         label: "Phone",
         type: "text",
      },
      {
         key: "website",
         label: "Website",
         type: "text",
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
               key: "suite",
               label: "Suite",
               type: "text",
            },
            {
               key: "city",
               label: "City",
               type: "text",
            },
            {
               key: "zipcode",
               label: "Zipcode",
               type: "text",
            },
            {
               key: "geo",
               label: "Geo",
               type: "text",
               children: [
                  {
                     key: "lat",
                     label: "Lat",
                     type: "text",
                  },
                  {
                     key: "lng",
                     label: "Lng",
                     type: "text",
                  },
               ],
            },
         ],
      },
      {
         key: "company",
         label: "Company",
         type: "text",
         children: [
            {
               key: "name",
               label: "Name",
               type: "text",
            },
            {
               key: "catchPhrase",
               label: "Catch Phrase",
               type: "text",
            },
            {
               key: "bs",
               label: "BS",
               type: "text",
            },
         ],
      },
   ],

   rows: [
      {
         id: 1,
         name: "Leanne Graham",
         username: "Bret",
         email: "Sincere@april.biz",
         address: {
            street: "Kulas Light",
            suite: "Apt. 556",
            city: "Gwenborough",
            zipcode: "92998-3874",
            geo: {
               lat: "-37.3159",
               lng: "81.1496",
            },
         },
         phone: "1-770-736-8031 x56442",
         website: "hildegard.org",
         company: {
            name: "Romaguera-Crona",
            catchPhrase: "Multi-layered client-server neural-net",
            bs: "harness real-time e-markets",
         },
      },
      {
         id: 2,
         name: "Ervin Howell",
         username: "Antonette",
         email: "Shanna@melissa.tv",
         address: {
            street: "Victor Plains",
            suite: "Suite 879",
            city: "Wisokyburgh",
            zipcode: "90566-7771",
            geo: {
               lat: "-43.9509",
               lng: "-34.4618",
            },
         },
         phone: "010-692-6593 x09125",
         website: "anastasia.net",
         company: {
            name: "Deckow-Crist",
            catchPhrase: "Proactive didactic contingency",
            bs: "synergize scalable supply-chains",
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
