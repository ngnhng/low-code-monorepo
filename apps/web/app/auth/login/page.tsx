"use client";

import "./style.css";
import Image from "next/image";
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

   if (loading) {
      return <div>Loading...</div>;
   }

   // If logged in, redirect to dashboard
   if (isLoggedIn) {
      router.push("/dashboard");

      return <div>Loading...</div>;
   }

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
                     <span className="text-container">Sign in with Google</span>
                  </div>
               </a>
            </div>
         </div>
      </div>
   );
}
