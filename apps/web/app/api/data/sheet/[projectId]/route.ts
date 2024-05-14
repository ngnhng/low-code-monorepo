import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

import {
  formatColumnFromSheet,
  formatDataFromSheet,
  getBearerToken,
} from "../_utils/utils";

const AUTH_SERVICE_BASE = process.env.NEXT_PUBLIC_AUTH_API_URL;
// eslint-disable-next-line turbo/no-undeclared-env-vars
const DBMS_SERVICE_BASE = process.env.NEXT_PUBLIC_DBMS_API_URL;

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const bearerToken = getBearerToken(
    request.headers.get("authorization") ?? ""
  );

  if (!bearerToken) {
    return new NextResponse("Unauthorized", {
      status: 401,
    });
  }

  const { spreadsheetsId, sheetRange, headerTitle, title } =
    await request.json();

  const config = {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  };

  const atRes = await axios.get(
    `${AUTH_SERVICE_BASE}/api/v1/access_token/google`,
    config
  );

  if (!atRes) {
    return new NextResponse("Unauthorized", {
      status: 401,
    });
  }

  const sheetData = await axios.get(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetsId}/values/${sheetRange}?majorDimension=COLUMNS&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING`,
    {
      headers: {
        Authorization: `Bearer ${atRes.data.access_token}`,
      },
    }
  );

  const createTablePayload = {
    label: title,
    columns: formatColumnFromSheet(
      sheetData.data.values,
      sheetRange,
      headerTitle
    ),
  };

  console.log("RAW_SHEET", sheetData.data.values);
  console.log("CREATE_PAYLOAD:", createTablePayload);

  const newCreatedTable = await axios.post(
    `${DBMS_SERVICE_BASE}/projects/${params.projectId}/manage/tables`,
    {
      table: createTablePayload,
    },
    config
  );

  const insertRowsPayload = formatDataFromSheet(
    newCreatedTable.data.columns,
    sheetData.data.values,
    sheetRange,
    headerTitle
  );

  const insertedRows = await axios.post(
    `${DBMS_SERVICE_BASE}/projects/${params.projectId}/tables/${newCreatedTable.data.tid}/rows`,
    {
      rows: insertRowsPayload,
    },
    config
  );

  console.log("NEW_CREATED_TABLE", newCreatedTable.data);
  console.log("CREATE_PAYLOAD:", insertRowsPayload);
  console.log("INSERT_ROWS_RESPONSE:", insertedRows);

  return NextResponse.json("Success");
}
