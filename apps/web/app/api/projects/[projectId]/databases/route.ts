import axios, { AxiosRequestConfig } from "axios";

const baseUrl = process.env.NEXT_PUBLIC_DBMS_API_URL;

export async function POST(
    req: Request,
    { params }: { params: { projectId: string } }
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

    // call api to create a new project
    const axiosConfig: AxiosRequestConfig = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    console.log("Create DB request", params);
    const pid = params.projectId;
    if (pid == "" || pid == undefined) {
        return new Response("Project ID is required", {
            status: 400,
        });
    }

    try {
        const res = await axios.post(
            `${baseUrl}/projects/${pid}/databases`,
            axiosConfig
        );

        return new Response(JSON.stringify(res.data.result), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.log("Create project error", error);
        return new Response("Failed to create project" + error, {
            status: 500,
        });
    }
}
