import { EnvVariable, getEnv } from "../../../utils/getEnv";
import axios from "axios";

type TokenResponse = [string, string];

export async function GET(request: Request) {
    const serverOAuthUrl = getEnv(EnvVariable.LOGIN_REQUEST);
    const serverCallbackUrl = getEnv(EnvVariable.LOGIN_CALLBACK);
    const successUrl = "http://localhost:3001/auth/login?success=1";

    // get query param ?success=1
    const incomingUrl = new URL(request.url ?? "");
    const params = incomingUrl.searchParams;

    if (params.get("code")) {
        // split from the first ?
        const [_, query] = incomingUrl.search.split("?");

        // append the query to the callback url
        const callbackUrl = new URL(serverCallbackUrl);
        callbackUrl.search = query;

        console.log(callbackUrl.toString());

        // GET the callback url
        const response = await axios
            .get(callbackUrl.toString())
            .catch((err) => {
                console.log(err);
            });

        console.log(response);

        // redirect to the success page
        return Response.redirect(successUrl, 302);
    }

    // redirect caller to the server oauth url
    return Response.redirect(serverOAuthUrl, 302);
}
