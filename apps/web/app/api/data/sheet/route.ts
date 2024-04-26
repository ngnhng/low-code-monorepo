/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from "axios";
import moment from "moment";
import path from "node:path";
import fs from "node:fs";
import fsa from "node:fs/promises";

import { NextRequest, NextResponse } from "next/server";
import { formatSheetData } from "./_utils/utils";

export async function POST(request: NextRequest) {
  const bearerToken = getBearerToken(
    request.headers.get("authorization") ?? ""
  );

  if (!bearerToken) {
    return new NextResponse("Unauthorized", {
      status: 401,
    });
  }

  const { spreadsheetsId, sheetRange, headerTitle } = await request.json();
  const config = {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  };

  const atRes = await axios.get(
    `http://localhost:80/auth-api/api/v1/access_token/google`,
    config
  );

  const sheetData = await axios.get(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetsId}/values/${sheetRange}?majorDimension=COLUMNS&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING`,
    {
      headers: {
        Authorization: `Bearer ${atRes.data.access_token}`,
      },
    }
  );

  console.log("Raw Sheet:", sheetData.data.values);

  console.log(
    "Transform Sheet:",
    formatSheetData(sheetData.data.values, sheetRange, {
      headerTitle: headerTitle,
    })
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
