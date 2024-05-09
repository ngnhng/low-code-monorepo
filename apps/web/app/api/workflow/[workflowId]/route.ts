import defaultXml from "../../../[projectId]/workflow/_testdata/default-xml";
import googleSheetXml from "../../../[projectId]/workflow/_testdata/google-sheet-xml";

export async function GET(
    req: Request,
    { params }: { params: { workflowId: string } }
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

    const workflowId = params.workflowId;

    // call api to get the workflow list
    // TODO: Implement fetchWorkflowNameList

    // MOCK
    switch (workflowId) {
        case "default": {
            return new Response(
                defaultXml,
                {
                    headers: {
                        "Content-Type": "text/xml",
                    },
                }
            );
        }
        case "google-sheet-example": {
            return new Response(
                googleSheetXml,
				{
					headers: {
						"Content-Type": "text/xml",
					},
				}
            );
        }

        default: {
            return new Response(`Not implemented ${workflowId}`, {
                status: 501,
                statusText: `Not implemented ${workflowId}`,
            });
        }
    }
}
