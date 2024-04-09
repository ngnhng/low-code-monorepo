// POST /api/mock/[project-id]/data/[table-id]/rows

import path from "node:path";
import fs from "node:fs/promises";
import { NextRequest, NextResponse } from "next/server";

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

// * [GET]: table data records
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; tableId: string } }
) {
  const tableDataPath = path.join(
    process.cwd(),
    `app/api/mock/[projectId]/data/[tableId]/${params.projectId}-${params.tableId}.json`
  );

  try {
    const tableData = JSON.parse(await fs.readFile(tableDataPath, "utf8"));

    const records = tableData.rows;

    return NextResponse.json(records, {
      status: 200,
    });
  } catch {
    return new NextResponse("Internal Server Error", {
      status: 500,
    });
  }
}
