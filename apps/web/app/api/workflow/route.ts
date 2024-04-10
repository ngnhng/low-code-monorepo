//import axios, { AxiosRequestConfig } from "axios";

//const baseURL = process.env.NEXT_PUBLIC_USER_API_URL;

const mockData = {
    ids: ["default", "google-sheet-example"],
};

export async function GET() {
    //const { headers, json } = req;
    //// extract the Bearer Token from the request headers
    //const token = headers.get("Authorization")?.split(" ")[1];

    //if (!token) {
    //    return new Response("Unauthorized", {
    //        status: 401,
    //    });
    //}

    //const axiosConfig: AxiosRequestConfig = {
    //    headers: {
    //        Authorization: `Bearer ${token}`,
    //    },
    //};
    // call api to get the workflow list

    //try {
    //	const res = await axios.get(`${baseURL}/workflow`)

    //}

    return new Response(JSON.stringify(mockData), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
}
