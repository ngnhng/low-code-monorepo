"use client"

import "./NavBar.css";

import Link from "next/link";
import Image from "next/image";

import useAuth from "../../hooks/useAuth";
import { AuthState } from "../../hooks/useAuth";

export default function NavBar() {
   const [authState] = useAuth();

   const renderNav = () => {
      if (authState === AuthState.LOGGED_IN)
         return (
            <>
               <Link href="./projects">
                  <div className="navItem">Projects</div>
               </Link>
               <Link href="./">
                  <div className="navItem">Placeholder #1</div>
               </Link>
               <Link href="./">
                  <div className="navItem">Placeholder #2</div>
               </Link>
               <Link href="./">
                  <div className="navItem">Placeholder #3</div>
               </Link>
            </>
         );

      return "";
   };

   const renderUser = () => {
      if (authState === AuthState.LOGGED_IN) {
         return (
            <div className="user">
               <Image src="/g-logo.png" width={30} height={30} alt="" />
               <div className="userInfo">
                  <div className="welcome">Welcome back</div>
                  <div className="userName">{"Test userName"}</div>
               </div>
            </div>
         );
      }

      return (
         <Link href="./auth/login">
            <div className="navItem">Sign in</div>
         </Link>
      );
   };

   return (
      <div className="navBar">
         <div className="left">
            <Link href="./">
               <div className="home"></div>
            </Link>
            {renderNav()}
         </div>

         <div className="right">{renderUser()}</div>
      </div>
   );
}
