import axios from "axios";
import { AxiosRequestConfig } from "axios";

const baseURL = process.env.NEXT_PUBLIC_WORKFLOW_API_URL;

export async function POST(req: Request) {
    const { headers, json } = req;
    const { workflow_id, process_definition, variable_mapping } = await json();

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

    console.log("Launch Payload", {
        workflow_id,
        process_definition,
        variable_mapping,
    });

    try {
        const res = await axios.post(
            `${baseURL}/workflow`,
            {
                workflow_id,
                process_definition,
                variable_mapping,
            },
            axiosConfig
        );

        return new Response(res.data, {
            status: 200,
        });
    } catch (error) {
        return new Response(`Failed to launch workflow: ${error}`, {
            status: 500,
        });
    }
}
