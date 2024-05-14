import axios, { AxiosRequestConfig } from "axios";

const baseUrl = process.env.NEXT_PUBLIC_USER_API_URL;

export async function GET(
    req: Request,
    {
        params,
    }: {
        params: {
            projectId: string;
            workflowId: string;
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
    const workflowId = params.workflowId;

    try {
        const res = await axios.get(
            `${baseUrl}/api/workflows/${projectId}?workflowId=${workflowId}`,
            axiosConfig
        );

        console.log(res.data.result);

        if (res.data.result.data.length === 0) {
            return new Response("No workflows found", {
                status: 404,
            });
        }

        //const xml = res.data.result.data[0].wfData;
        // filter based on workflowId
        const xml = res.data.result.data.find(
            (wf: any) => wf.wid === workflowId
        ).wfData;

        return new Response(xml, {
            status: 200,
            headers: {
                "Content-Type": "text/xml",
            },
        });
    } catch (error) {
        return new Response(`Failed to get views: ${error}`, {
            status: 500,
        });
    }
}

export async function PUT(
    req: Request,
    {
        params,
    }: {
        params: {
            projectId: string;
            workflowId: string;
        };
    }
) {
    // get params from request
    const { headers } = req;
    const body = await req.text();
    // extract the Bearer Token from the request headers
    const token = headers.get("Authorization")?.split(" ")[1];

    if (!token) {
        return new Response("Unauthorized", {
            status: 401,
        });
    }

    console.log("update", body);

    // call api to get the project list
    const axiosConfig: AxiosRequestConfig = {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/xml",
        },
    };
    const workflowId = params.workflowId;

    try {
        const res = await axios.put(
            `${baseUrl}/api/workflows/${workflowId}`,
            body,
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
        return new Response(`Failed to update workflow: ${error}`, {
            status: 500,
        });
    }
}
