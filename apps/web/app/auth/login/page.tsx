//"use client";

//import { useRouter } from "next/navigation";
import "./style.css";
import { EnvVariable, getEnv } from "../../../utils/getEnv";
import Image from "next/image";
import useLocalStorage from "../../../hooks/useLocalStorage";
import { headers } from "next/headers";

export default function Page() {
    const header = headers();

    console.log(header);


    //const router = useRouter();
    //const [accessToken, setAccessToken] = useLocalStorage("access_token", "");

    const serverOAuthURL = getEnv(EnvVariable.LOGIN_REQUEST);

    //useEffect(() => {
    //    // TODO: abstract to a useUser hook if possible
    //    if (accessToken) {
    //        router.push("/profile");
    //    }
    //}, [accessToken, router]);

    return (
        <div className="container">
            <div className="form-container">
                <h1>Login</h1>
                <div className="form">
                    <p>Access feature by google login</p>
                    <a href="/api/auth" className="g-login-button">
                        <div className="content-wrapper">
                            <div className="logo-wrapper">
                                <Image
                                    src="/g-logo.png"
                                    alt="Google logo"
                                    width={24}
                                    height={24}
                                />
                            </div>
                            <span className="text-container">
                                Sign in with Google
                            </span>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
}
