//Mock endpoint for database
// Spec:

// GET /api/mock/{projectId}/data/all: Get all data for a project

import { NextResponse, type NextRequest } from "next/server";
import fs from "fs";
import fsa from "fs/promises";
import path from "path";
import { columns, addresses, posts } from "../[tableId]/route";

import { TableItem } from "types/table-data";

const TABLES: TableItem[] = [
  {
    id: "0",
    name: "Table 1",
    source: "Source 1",
    created: "2021-08-01",
    updated: "2021-08-01",
    status: "Active",
    columns: columns,
    referenceTables: [],
  },
  {
    id: "1",
    name: "Table 2",
    source: "Source 2",
    created: "2021-08-01",
    updated: "2021-08-01",
    status: "Active",
    columns: posts,
    referenceTables: [],
  },
  {
    id: "2",
    name: "Table 3",
    source: "Source 3",
    created: "2021-08-01",
    updated: "2021-08-01",
    status: "Active",
    columns: addresses,
    referenceTables: [],
  },
];

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const databasePath = path.join(
    process.cwd(),
    `app/api/mock/[projectId]/data/all/${params.projectId}.json`
  );

  let previosData;

  try {
    const data = await fsa.readFile(databasePath, "utf-8");

    previosData = JSON.parse(data);

    // console.log("data: " + JSON.stringify(data));
  } catch (error) {
    console.log(error);
    return new NextResponse("", { status: 500 });
  }

  const tables = TABLES.concat(previosData);

  return new Response(JSON.stringify(tables), {
    headers: { "content-type": "application/json" },
  });
}
