/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { getBearerToken } from "../../_utils/utils";

const serviceBaseUrl = process.env.SERVICE_BASE_URL;

/*
 * [GET]: GET all tables of projects
 * [API]: GET /projects/:projectId/manage/tables
 */

export async function GET(
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

  const response = await axios.get(
    `${serviceBaseUrl}/dbms/projects/${params.projectId}/manage/tables`,
    config
  );

  return new NextResponse(JSON.stringify(response.data), {
    status: 200,
  });
}
