/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { getBearerToken, mappingTypeToUI } from "app/api/dbms/_utils/utils";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { ColumnDef } from "types/table-data";

const serviceBaseUrl = process.env.SERVICE_BASE_URL;

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string; tableId: string } }
) {
  const bearerToken = getBearerToken(
    request.headers.get("authorization") ?? ""
  );

  const configs = {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  };

  const data = await request.json();

  const response = await axios.post(
    `${serviceBaseUrl}/dbms/projects/${params.projectId}/tables/${params.tableId}/query`,
    data,
    configs
  );

  const modifiedColumns: ColumnDef[] = response.data.columns.map((column) => ({
    id: column.id,
    label: column.name,
    type: mappingTypeToUI(column.type),
    isActive: true,
    isPrimaryKey: false,
    isForeignKey: false,
  }));

  const modifiedRows = response.data.rows.map((row) => {
    const rowObject = {};
    // eslint-disable-next-line unicorn/no-array-for-each
    response.data.columns.forEach((column, index) => {
      rowObject[column.id] = row[index];
    });
    return rowObject;
  });

  return NextResponse.json(
    {
      columns: modifiedColumns,
      rows: modifiedRows,
    },
    { status: 200 }
  );
}
