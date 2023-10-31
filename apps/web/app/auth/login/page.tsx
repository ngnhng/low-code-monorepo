"use client";

import "./style.css";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [loading, setLoading] = useState(true);

   const authUrl = "/api/auth?isLoggedIn=ask";

   const router = useRouter();

   useEffect(() => {
      fetch(authUrl)
         .then((res) => res.json())
         .then((data) => {
            console.log(data);
            setIsLoggedIn(data.isLoggedIn);
            setLoading(false);

            // If logged in, redirect to dashboard
            if (data.isLoggedIn) {
               router.push("/dashboard");
            }
         })
         .catch((err) => {});
   }, []);

   if (loading) {
      return <div>Loading...</div>;
   }

   // If logged in, redirect to dashboard
   if (isLoggedIn) {
      return null;
   }

   return (
      <div className="container">
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
      </div>
   );
}
