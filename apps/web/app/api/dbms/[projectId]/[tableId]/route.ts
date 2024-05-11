/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  getBearerToken,
  inferTypeFromService,
  mappingTypeToUI,
} from "app/api/dbms/_utils/utils";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { ColumnDef } from "types/table-data";

const serviceBaseUrl = process.env.SERVICE_BASE_URL;

/*
 * [POST]: POST -> GET a table records
 * [API]: POST /projects/:projectsId/tables/:tablesId/query
 */

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

  // const modifiedRows = response.data.data.map((row) => {
  //   const rowObject = {};
  //   // eslint-disable-next-line unicorn/no-array-for-each
  //   response.data.columns.forEach((column, index) => {
  //     rowObject[column.id] = inferTypeFromService(column.type, row[index]);
  //   });
  //   return rowObject;
  // });

  return NextResponse.json(response.data, { status: 200 });
}

/*
 * [GET]: GET -> GET a table columns
 * [API]: GET /projects/:projectId/manage/tables/:tableId
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; tableId: string } }
) {
  const bearerToken = getBearerToken(
    request.headers.get("authorization") ?? ""
  );

  const config = {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  };

  const response = await axios.get(
    `${serviceBaseUrl}/dbms/projects/${params.projectId}/manage/tables/${params.tableId}`,
    config
  );

  const modifiedColumns: ColumnDef[] = response.data.columns.map((column) => ({
    id: column.id,
    label: column.label,
    name: column.name,
    type: mappingTypeToUI(column.type),
    referenceTable: column.reference?.table_id,
    isActive: true,
    isPrimaryKey: false,
    isForeignKey: false,
  }));

  return NextResponse.json(
    { ...response.data, columns: modifiedColumns },
    { status: 200 }
  );
}
