import axios, { AxiosRequestConfig } from "axios";
import { type NextRequest } from "next/server";

const baseUrl = process.env.NEXT_PUBLIC_USER_API_URL;

export async function GET(
    req: Request,
    {
        params,
    }: {
        params: {
            projectId: string;
        };
    }
) {
    // get params from request
    const { headers } = req;
    // extract the Bearer Token from the request headers
    const token = headers.get("Authorization")?.split(" ")[1];

    if (!token) {
        return new Response("Unauthorized", {
            status: 401,
        });
    }

    // call api to get the project list
    const axiosConfig: AxiosRequestConfig = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const projectId = params.projectId;

    try {
        const res = await axios.get(
            `${baseUrl}/api/workflows/${projectId}`,
            axiosConfig
        );

        console.log(res.data.result);

        return new Response(JSON.stringify(res.data.result), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        return new Response(`Failed to get views: ${error}`, {
            status: 500,
        });
    }
}

export async function POST(
    req: NextRequest,
    {
        params,
    }: {
        params: {
            projectId: string;
        };
    }
) {
    // get params from request
    const { headers, nextUrl, url } = req;
    const body = await req.text();
    console.log("Body", body);
    console.log("URL", url);
    // extract the Bearer Token from the request headers
    const token = headers.get("Authorization")?.split(" ")[1];

    if (!token) {
        return new Response("Unauthorized", {
            status: 401,
        });
    }

    // call api to get the project list
    const axiosConfig: AxiosRequestConfig = {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/xml",
        },
    };

    const projectId = params.projectId;
    const searchParams = nextUrl.searchParams;
    const title = searchParams.get("title");

    if (!title) {
        return new Response("Title is required", {
            status: 400,
        });
    }

    console.log("Creating workflow", title, body, projectId);

    try {
        const res = await axios.post(
            `${baseUrl}/api/workflows/${projectId}?title=${title}`,
            body,
            axiosConfig
        );

        console.log("Creating workflow", body, projectId);

        return new Response(JSON.stringify(res.data.result), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        return new Response(`Failed to create workflow: ${error}`, {
            status: 500,
        });
    }
}
