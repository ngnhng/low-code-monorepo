import axios from "axios";
import { AxiosRequestConfig } from "axios";

const baseURL = process.env.NEXT_PUBLIC_WORKFLOW_API_URL;

export async function POST(req: Request) {
    const { headers, json } = req;
    const { workflow_id, process_definition, variables } = await json();

    // extract the Bearer Token from the request headers
    const token = headers.get("Authorization")?.split(" ")[1];

    if (!token) {
        return new Response("Unauthorized", {
            status: 401,
        });
    }

    const axiosConfig: AxiosRequestConfig = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    // create a request with Bearer Token Auth

    try {
        const res = await axios.post(
            `${baseURL}/workflow`,
            {
                workflow_id,
                process_definition,
                variables,
            },
            axiosConfig
        );

        return new Response(res.data, {
            status: 200,
        });
    } catch {
        return new Response("Failed to launch workflow", {
            status: 500,
        });
    }
}
