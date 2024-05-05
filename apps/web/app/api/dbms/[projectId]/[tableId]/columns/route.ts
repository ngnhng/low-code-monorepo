/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { getBearerToken } from "app/api/dbms/_utils/utils";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const serviceBaseUrl = process.env.SERVICE_BASE_URL;

/*
 * [POST]: create column of projects
 * [API]: POST /projects/:projectId/tables/:tableId/columns
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

  const data = await request.json();

  const response = await axios.post(
    `${serviceBaseUrl}/dbms/projects/${params.projectId}/tables/${params.tableId}/columns`,
    data,
    config
  );

  return new NextResponse(JSON.stringify(response.data), {
    status: 200,
  });
}
