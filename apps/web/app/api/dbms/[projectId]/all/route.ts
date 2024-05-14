/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { getBearerToken } from "../../_utils/utils";

const serviceBaseUrl = process.env.NEXT_PUBLIC_DBMS_API_URL;

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

    return await axios
        .get(
            `${serviceBaseUrl}/projects/${params.projectId}/manage/tables`,
            config
        )
        .then((response) => {
            return NextResponse.json(response.data, { status: 200 });
        })
        .catch((error) => {
            return NextResponse.json(error.response.data, {
                status: error.response.status,
            });
        });
}
