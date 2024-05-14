import axios, { AxiosRequestConfig } from "axios";

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
            `${baseUrl}/api/projects/${projectId}`,
            axiosConfig
        );

        return new Response(JSON.stringify(res.data.result), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch {
        return new Response("Failed to get project list", {
            status: 500,
        });
    }
}
