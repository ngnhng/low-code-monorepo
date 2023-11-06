"use client";

import "./style.css";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import useAuth from "../../../hooks/useAuth";
import { AuthState } from "../../../hooks/useAuth";

export default function Page() {
   const [authState] = useAuth();
   const router = useRouter();

   const conditionalRender = () => {
      switch (authState) {
         case AuthState.LOADING:
            return <div>Loading...</div>;
         case AuthState.LOGGED_IN:
            router.push("/projects");
            return <div>Loading...</div>;
         case AuthState.LOGGED_OUT:
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
      }
   };

   return <div className="container">{conditionalRender()}</div>;
}
