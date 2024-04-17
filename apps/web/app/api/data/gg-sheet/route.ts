/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

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

  console.log("Google Sheet:", sheetData.data);

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
