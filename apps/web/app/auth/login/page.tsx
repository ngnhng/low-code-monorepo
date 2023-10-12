import { redirect } from "next/navigation";

export default function Page() {
    const redirectUri = "http://localhost:3000/api/oauth/google/callback";
    const serverOAuthURL = "http://localhost:3000/api/oauth/google";

    return (
        <div>
            <h1>Google OAuth</h1>
            <a href={`${serverOAuthURL}?`}>Login with Google</a>
        </div>
    );
}
