/* eslint-disable @typescript-eslint/no-unused-vars */
import axios, { AxiosRequestConfig } from "axios";

const baseUrl = process.env.NEXT_PUBLIC_USER_API_URL;

export async function GET(
    request: Request,
    {
        params,
    }: {
        params: {
            projectId: string;
        };
    }
) {
    // get params from request
    const { headers } = request;
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

    const { projectId } = params;

    try {
        //const res = await axios.get(
        //    `${baseUrl}/api/projects/${projectId}/integrations/sheets`,
        //    axiosConfig
        //);

        return new Response(JSON.stringify(returnMockData(projectId)), {
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

type SheetsResponse = {
    spreadsheets: {
        id: string;
        name: string;
        worksheets: {
            id: string;
            name: string;
            rows: string[];
        }[];
    }[];
};

const returnMockData = (projectId: string): SheetsResponse => {
    return {
        spreadsheets: mockSpreadSheets.map((sheet) => ({
            id: sheet.id,
            name: sheet.name,
            worksheets: mockWorksheets[sheet.id].map((worksheet) => ({
                id: worksheet,
                name: worksheet,
                rows: mockRows[worksheet],
            })),
        })),
    };
};

const mockSpreadSheets = [
    {
        id: "zbv1324",
        name: "MyFile1",
    },
    {
        id: "zbv1325",
        name: "MyFile2",
    },
    {
        id: "zbv1326",
        name: "MyFile3",
    },
];

const mockWorksheets = {
    zbv1324: ["sheet1", "sheet2", "sheet3"],
    zbv1325: ["sheet4", "sheet5", "sheet6"],
    zbv1326: ["sheet7", "sheet8", "sheet9"],
};

const mockRows = {
    sheet1: ["row1", "row2", "row3"],
    sheet2: ["row4", "row5", "row6"],
    sheet3: ["row7", "row8", "row9"],
    sheet4: ["row10", "row11", "row12"],
    sheet5: ["row13", "row14", "row15"],
    sheet6: ["row16", "row17", "row18"],
    sheet7: ["row19", "row20", "row21"],
    sheet8: ["row22", "row23", "row24"],
    sheet9: ["row25", "row26", "row27"],
};
