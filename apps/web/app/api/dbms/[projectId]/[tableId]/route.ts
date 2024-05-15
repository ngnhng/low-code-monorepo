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

const serviceBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

/*
 * [POST]: POST -> GET a table records
 * [API]: POST /projects/:projectsId/tables/:tablesId/query
 */

export async function POST(
    request: NextRequest,
    { params }: { params: { projectId: string; tableId: string } }
) {
    // get params from request
    const { headers } = request;
    // extract the Bearer Token from the request headers
    const token = headers.get("Authorization")?.split(" ")[1];

    if (!token) {
        return new Response("Unauthorized", {
            status: 401,
        });
    }

    const data = await request.json();

    if (!params.projectId || !params.tableId) {
        return NextResponse.json(
            { error: "projectId or tableId is missing" },
            { status: 400 }
        );
    }

    const configs = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    try {
        const response = await axios.post(
            `${serviceBaseUrl}/dbms/projects/${params.projectId}/tables/${params.tableId}/query`,
            data,
            configs
        );

        return NextResponse.json(response.data, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "An error occurred while making the request" },
            { status: 500 }
        );
    }
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

    return NextResponse.json(response.data, { status: 200 });
}
