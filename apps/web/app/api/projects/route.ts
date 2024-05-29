import axios, { AxiosRequestConfig } from "axios";

const baseUrl = process.env.NEXT_PUBLIC_USER_API_URL;
const dbmsUrl = process.env.NEXT_PUBLIC_DBMS_API_URL;

export async function GET(req: Request) {
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

    try {
        const res = await axios.get(`${baseUrl}/api/projects`, axiosConfig);

        return new Response(JSON.stringify(res.data.result), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        return new Response(`Failed to get project list: ${error}`, {
            status: 500,
        });
    }
}

export async function POST(req: Request) {
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

    // call api to create a new project
    const axiosConfig: AxiosRequestConfig = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    try {
        const res = await axios.post(
            `${baseUrl}/api/projects`,
            body,
            axiosConfig
        );
        const pid = res.data.result.data.pid;

        console.log("Create project reponse:", pid);

        if (!pid) {
            throw new Error("Failed to create project");
        }

        const dbRes = await axios.post(
            `${dbmsUrl}/projects/${pid}/databases`,
            {
                pid,
            },
            axiosConfig
        );

        console.log(dbRes.data);

        return new Response(JSON.stringify(res.data.result), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch {
        return new Response("Failed to create project", {
            status: 500,
        });
    }
}
