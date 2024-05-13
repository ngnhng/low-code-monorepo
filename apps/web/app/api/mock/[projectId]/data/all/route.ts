//Mock endpoint for database
// Spec:

// GET /api/mock/{projectId}/data/all: Get all data for a project

import { NextResponse } from "next/server";
// import fs from 'fs';
import fsa from "node:fs/promises";
import path from "node:path";
import { columns, addresses, posts } from "../[tableId]/_utils/utils";

// import { TableItem } from "types/table-data";

const TABLES = [
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

export async function GET() {
  // { params }:  { params: {projectId: string}}
  // const id = params.projectId ? params.projectId : 'trollface';

  const databasePath = path.join(
    process.cwd(),
    `app/api/mock/[projectId]/data/all/trollface.json`
  );
  let previosData;

  try {
    const data = await fsa.readFile(databasePath, "utf8");

    previosData = JSON.parse(data);

    // console.log("data: " + JSON.stringify(data));
  } catch (error) {
    console.log(error);
    return new NextResponse("error", { status: 500 });
  }

  const tables = [...TABLES, ...previosData];

  return new Response(JSON.stringify(tables), {
    headers: { "content-type": "application/json" },
  });
}
