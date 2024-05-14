import axios, { AxiosRequestConfig } from "axios";

const baseUrl = process.env.NEXT_PUBLIC_USER_API_URL;

export async function POST(
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
    const body = await req.json();
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
        const res = await axios.post(
            `${baseUrl}/api/projects/${projectId}/views`,
            body,
            axiosConfig
        );

        console.log(body, projectId);

        return new Response(JSON.stringify(res.data.result), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        return new Response(`Failed to create view: ${error}`, {
            status: 500,
        });
    }
}
