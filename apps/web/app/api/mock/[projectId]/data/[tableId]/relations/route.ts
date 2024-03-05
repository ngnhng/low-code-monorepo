import path from "node:path";
import fs from 'node:fs/promises';
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; tableId: string } }
) {
  const databasePath = path.join(
    process.cwd(),
    `app/api/mock/[projectId]/data/all/${params.projectId}.json`,
  );

  try {
    const projectTables = JSON.parse(await fs.readFile(databasePath, 'utf8'));

    const requestTable = projectTables.find(table => table.id === params.tableId);

    if (!requestTable) {
      return new NextResponse("NO TABLE FOUND", {
        status: 404,
      });
    }

    const referenceTables = projectTables.filter(table => requestTable.referenceTables.includes(table.id));

    referenceTables.push(requestTable);

    return NextResponse.json(referenceTables, {status: 200});

  } catch {
    return new NextResponse(
      'INTERNAL ERROR',
      {
        status: 500,
      }
    )
  }
}