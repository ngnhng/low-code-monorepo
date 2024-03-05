import Link from "next/link";
import React from "react";
import './profile-bar.css'
import SignInButton from "./sign-in-button";

const ProfileBar = () => {
  return (
    <div className="navbar-container">
      <Link className={`link`} href={`/`}>Home Page</Link>

      <Link className={`link`} href={`/dashboard`}> Dashboard </Link>

      <SignInButton />
    </div>
  )
}

export default ProfileBar;