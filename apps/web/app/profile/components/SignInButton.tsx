"use client";

import useLocalStorage from "../../../hooks/useLocalStorage";
import Link from "next/link";
import React from "react";

import "./SignInButton.css";

const SignInButton = () => {
    const [accessToken, setAccessToken] = useLocalStorage("access_token", "");

    if (accessToken) {
        return (
            <div className={`container`}>
                <p className="text">Name of User</p>
                <Link href={"/auth/logout"} className={`link sign-out-button`}>
                    Sign Out
                </Link>
            </div>
        );
    }

    return (
        <div className={`container`}>
            <Link href={"/auth/login"} className={`link sign-in-button`}>
                Sign Up & Sign In
            </Link>
        </div>
    );
};

export default SignInButton;
