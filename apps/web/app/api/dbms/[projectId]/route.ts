/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { getBearerToken } from "../_utils/utils";

const serviceBaseUrl = process.env.NEXT_PUBLIC_DBMS_API_URL;

/*
 * [POST]: POST create a table of projects
 * [API]: POST /projects/:projectId/manage/tables
 */

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const bearerToken = getBearerToken(
    request.headers.get("authorization") ?? ""
  );

  const config = {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  };

  const { table } = await request.json();

  const response = await axios.post(
    `${serviceBaseUrl}/projects/${params.projectId}/manage/tables`,
    {
      table: table,
    },
    config
  );

  return NextResponse.json(response.data, { status: 200 });
}
