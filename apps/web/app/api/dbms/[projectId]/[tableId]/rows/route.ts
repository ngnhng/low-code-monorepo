/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { getBearerToken } from "app/api/dbms/_utils/utils";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const serviceBaseUrl = process.env.SERVICE_BASE_URL;

/*
 * [POST]: adđ rows of projects
 * [API]: POST /projects/:projectId/tables/:tableId/rows
 */

export async function POST(
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

  const insertRows = await request.json();

  const response = await axios.post(
    `${serviceBaseUrl}/dbms/projects/${params.projectId}/tables/${params.tableId}/rows`,
    insertRows,
    config
  );

  return new NextResponse(JSON.stringify(response.data), {
    status: 200,
  });
}

/*
 * [PATCH]: update rows of projects
 * [API]: PATCH /projects/:projectId/tables/:tableId/rows
 */

export async function PATCH(
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

  const data = await request.json();

  const response = await axios.patch(
    `${serviceBaseUrl}/dbms/projects/${params.projectId}/tables/${params.tableId}/rows`,
    data,
    config
  );

  return new NextResponse(JSON.stringify(response.data), {
    status: 200,
  });
}

/*
 * [DELETE]: delete rows of projects
 * [API]: DELETE /projects/:projectId/tables/:tableId/rows
 */

export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; tableId: string } }
) {
  const bearerToken = getBearerToken(
    request.headers.get("authorization") ?? ""
  );

  const data = await request.json();

  console.log("DELETE", data);

  const response = await axios.delete(
    `${serviceBaseUrl}/dbms/projects/${params.projectId}/tables/${params.tableId}/rows`,
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
      data: data,
    }
  );

  return new NextResponse(JSON.stringify(response.data), {
    status: 200,
  });
}
