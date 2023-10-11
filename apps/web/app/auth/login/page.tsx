import { redirect } from "next/navigation";

export default function Page() {
    const googleOAuthURL = "https://accounts.google.com/o/oauth2/v2/auth";
    const redirectUri = "http://localhost:3000/api/oauth/google/callback";

    const scope = [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" ");

    const params = new URLSearchParams({
        scope,
        redirect_uri: redirectUri,
        response_type: "code",
        prompt: "select_account",
        // eslint-disable-next-line turbo/no-undeclared-env-vars
        client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
    }).toString();

    console.log(params);

    // redirect to google oauth
    //redirect(`${googleOAuthURL}?${params}`);

    return (
        <div>
            <h1>Google OAuth</h1>
            <a href={`${googleOAuthURL}?${params}`}>Login with Google</a>
        </div>
    );
}
