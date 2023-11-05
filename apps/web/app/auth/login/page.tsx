"use client";

import "./style.css";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [loading, setLoading] = useState(true);

   const authUrl = "/api/auth/check";

   const router = useRouter();

   useEffect(() => {
      fetch(authUrl)
         .then((res) => res.json())
         .then((data) => {
            setIsLoggedIn(data.result);
            setLoading(false);
         })
         .catch((err) => {});
   }, []);

   const conditionalRender = () => {
      if (loading) {
         return <div>Loading...</div>;
      }

      return (
         <div className="form-container">
            <div className="loginLabel">Sign in with:</div>
            <div className="methodsList">
               <Link href="/api/auth" className="g-login-button">
                  <div className="content-wrapper">
                     <Image
                        src="/g-logo.png"
                        alt="Google logo"
                        width={30}
                        height={30}
                     />
                     <span className="text-container">Google</span>
                  </div>
               </Link>
            </div>
         </div>
      );
   };

   // If logged in, redirect to dashboard
   if (isLoggedIn) {
      router.push("/dashboard");

      return <div>Loading...</div>;
   }

   return <div className="container">{conditionalRender()}</div>;
}
