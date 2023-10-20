import { redirect } from "next/navigation";
import { headers } from 'next/headers'; 
import './style.css';


export default function LoginPage() {
    const redirectUri = "http://localhost:3000/api/oauth/google/callback";
    const serverOAuthURL = "http://localhost:3000/api/oauth/google";

    return (
			<div className="container">
				<div className="form-container">
					<h1>Login</h1>
					<div className="form">
						<p>Access feature by google login</p>

						<a href={serverOAuthURL}>
							<div className="g-login-button">
								<div className="content-wrapper">
									<div className="logo-wrapper">
										<img src="https://developers.google.com/identity/images/g-logo.png" alt="" />
									</div>
									<span className="text-container">
										Sign in with Google
									</span>
								</div>
							</div>
						</a>
					</div>
				</div>
			</div>
    );
}
