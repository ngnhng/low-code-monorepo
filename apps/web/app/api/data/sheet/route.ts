/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { ColumnDef, RowDef } from "types/table-data";

export async function POST(request: NextRequest) {
  const bearerToken = getBearerToken(
    request.headers.get("authorization") ?? ""
  );

  if (!bearerToken) {
    return new NextResponse("Unauthorized", {
      status: 401,
    });
  }

  const { spreadsheetsId, sheetRange } = await request.json();
  const config = {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  };

  const atRes = await axios.get(
    `http://localhost:80/auth-api/api/v1/access_token/google`,
    config
  );

  console.log("Google AT:", atRes.data);

  const sheetData = await axios.get(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetsId}/values/${sheetRange}`,
    {
      headers: {
        Authorization: `Bearer ${atRes.data.access_token}`,
      },
    }
  );

  console.log(
    "Google Sheet:",
    temporaryFormatGoogleSheetData(sheetData.data.values, spreadsheetsId)
  );

  return NextResponse.json(sheetData.data.values);
}

function getBearerToken(authorizationHeader: string): string | undefined {
  // Check if the header exists and starts with "Bearer " (case-insensitive)
  if (
    !authorizationHeader ||
    !authorizationHeader.toLowerCase().startsWith("bearer ")
  ) {
    return undefined;
  }

  // Split the header on space and return the second element (token)
  const parts = authorizationHeader.split(" ");
  return parts[1];
}

function temporaryFormatGoogleSheetData(
  sheetData: string[][],
  spreadsheetsId: string
) {
  if (sheetData.length === 0 || !sheetData[0]) {
    return;
  }

  // Create columns
  const numberOfColumns = sheetData[0].length;
  const tempColumns: ColumnDef[] = [];

  for (let i = 0; i < numberOfColumns; i++) {
    tempColumns.push({
      id: `col-${i}`,
      label: `Column ${i}`,
      type: "text",
      isActive: true,
      isPrimaryKey: true,
      isForeignKey: false,
      foreignKeyId: "",
    });
  }

  // Create rows
  const rows: RowDef[] = [];
  // eslint-disable-next-line unicorn/no-for-loop
  for (let i = 0; i < sheetData.length; i++) {
    if (!sheetData[i]) {
      continue;
    }

    rows.push({
      id: i + 1,
      ...combineArraysToObject(tempColumns, sheetData[i]!),
    });
  }

  const response = {
    columns: tempColumns,
    rows: rows,
  };

  return response;
}

function combineArraysToObject(
  ids: ColumnDef[],
  values: string[]
): { [key: string]: string } {
  if (ids.length !== values.length) {
    throw new Error("Arrays must have the same length");
  }

  return Object.fromEntries(ids.map((id, index) => [id.id, values[index]!]));
}
