/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from "axios";
import moment from "moment";
import path from "node:path";
import fs from "node:fs";
import fsa from "node:fs/promises";

// import { fromExcelDate } from "js-excel-date-convert";

import { NextRequest, NextResponse } from "next/server";
import { ColumnDef, ColumnType, RowDef } from "types/table-data";

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
      headerTitle: true,
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

// IN CASE: SHEET DATA OF USER CONTAINES LITTLE ERROR (NULL DATA, etc.)
function formatSheetData(sheetData: any[], range: string, options: any) {
  if (sheetData.length === 0 || !sheetData[0]) {
    return;
  }

  // columns process
  const rangeResult = getRangeDimensions(range.split("!")[1]!);
  const indexRow = options.headerTitle === false ? 0 : 1;
  const indexCol = 0;

  if (!rangeResult) {
    return;
  }

  const columns: ColumnDef[] = [];
  for (let i = indexCol; i < rangeResult.columns; i++) {
    let type;
    let index = indexRow;

    while (type === undefined) {
      if (sheetData[i]![index] !== undefined && sheetData[i]![index] !== "") {
        if (typeof sheetData[i]![index] === "string") {
          type = moment(sheetData[i]![index], [
            "MMM/DD/YYYY",
            "MM-DD-YYYY",
            "DD-MMM-YYYY",
            "YYYY-MM-DD",
            "DD-MM-YYYY",
          ]).isValid()
            ? "date"
            : "text";
        }

        if (typeof sheetData[i]![index] === "number") {
          type = "number";
        }

        if (typeof sheetData[i]![index] === "boolean") {
          type = "boolean";
        }

        index = 0;
        break;
      }
      index++;
    }

    const column: ColumnDef = {
      id:
        options.headerTitle === false
          ? `col-${i}`
          : `${sheetData[i]![0]?.toLowerCase()}`,
      label:
        options.headerTitle === false ? `Column ${i}` : `${sheetData[i]![0]}`,
      type: type,
      isActive: true,
      isPrimaryKey: true,
      isForeignKey: false,
      foreignKeyId: "",
    };

    columns.push(column);
  }

  // rows process
  const rows: RowDef[] = [];
  for (let i = indexRow; i < rangeResult.rows; i++) {
    const row: RowDef = {
      id: indexRow === 0 ? i + 1 : i,
    };

    for (let j = indexCol; j < rangeResult.columns; j++) {
      if (columns[j]?.type === "text") {
        row[`${columns[j]?.id}`] = sheetData[j]![i].toString();
      }

      if (columns[j]?.type === "number") {
        row[`${columns[j]?.id}`] = sheetData[j]![i];
      }

      if (columns[j]?.type === "boolean") {
        row[`${columns[j]?.id}`] = Boolean(sheetData[j]![i]);
      }

      if (columns[j]?.type === "date") {
        row[`${columns[j]?.id}`] = moment(sheetData[j]![i], [
          "MMM/DD/YYYY",
          "MM-DD-YYYY",
          "DD-MMM-YYYY",
          "YYYY-MM-DD",
          "DD-MM-YYYY",
        ]).format("YYYY-MM-DD");
      }
    }

    rows.push(row);
  }

  return {
    columns: columns,
    rows: rows,
  };
}

function getRangeDimensions(
  range: string
): { rows: number; columns: number } | undefined {
  const [startCell, endCell] = range.split(":");

  if (!startCell) {
    return;
  }

  if (!endCell) {
    return;
  }

  const startRow = Number.parseInt(startCell.slice(1), 10);
  const startCol = startCell.codePointAt(0)! - 65;
  const endRow = Number.parseInt(endCell.slice(1), 10);
  const endCol = endCell.codePointAt(0)! - 65;

  const rows = endRow - startRow + 1;
  const columns = endCol - startCol + 1;

  return { rows, columns };
}

function tempJSONWriter() {}
