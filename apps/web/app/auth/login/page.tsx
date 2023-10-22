'use client';

import { redirect } from "next/navigation";
import { useSearchParams } from "next/navigation";
import './style.css';
import { useEffect } from "react";

// * Receive token from query parameters
// * Save to local storage
// * May need to decrypt it and save user info to local storage?

export default function Page() {
    const serverOAuthURL = process.env.GOOGLE_LOGIN_REQUEST || "http://localhost:3000/api/oauth/google";

		const searchParams = useSearchParams()
		const accessToken = searchParams.get('access_token');
		const refreshToken = searchParams.get('refresh_token');

		useEffect(() => {
			// save access token and refresh token to local storage
			if (typeof window !== "undefined" && accessToken && refreshToken) {
				window.localStorage.setItem('access_token', JSON.stringify(accessToken));
				window.localStorage.setItem('refresh_token', JSON.stringify(refreshToken));

				// TODO: DECRYPT TOKEN HERE and SAVE INFORMATION TO LOCAL STORAGE ...

				redirect('/profile')
			}

			return;
			
		}, [])

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
