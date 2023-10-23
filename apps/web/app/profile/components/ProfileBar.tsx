import Link from "next/link";
import React from "react";
import './ProfileBar.css'
import SignInButton from "./SignInButton";

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