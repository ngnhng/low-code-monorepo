import axios, { AxiosRequestConfig } from "axios";

const baseUrl = process.env.NEXT_PUBLIC_USER_API_URL;

export async function PUT(
    req: Request,
    {
        params,
    }: {
        params: {
            projectId: string;
            viewId: string;
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
    const viewId = params.viewId;

    console.log(body)

    try {
        const res = await axios.put(
            `${baseUrl}/api/projects/${projectId}/views/${viewId}`,
            body,
            axiosConfig
        );

        return new Response(JSON.stringify(res.data.result), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        return new Response(`Failed save view: ${error}`, {
            status: 500,
        });
    }
}
