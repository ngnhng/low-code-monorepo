"use client";

import "./style.css";
import Image from "next/image";

export default function Page() {
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
