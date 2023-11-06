"use client";

import "./styles.css";

import { useRouter } from "next/navigation";

import useAuth from "../../hooks/useAuth";
import { AuthState } from "../../hooks/useAuth";

import Sidebar from "./components/Sidebar";

export default function Page() {
   const router = useRouter();
   // const [authState] = useAuth();
   const authState: AuthState = AuthState.LOGGED_IN;

   switch (authState) {
      case AuthState.LOGGED_IN:
         return (
            <div className="content">
               <Sidebar />
               <div className="page">
                  <div className="lePage"></div>
               </div>
            </div>
         );
      case AuthState.LOGGED_OUT:
         router.push("/auth/login");
         return <div className="content"></div>;
      default:
         return <div className="content"></div>;
   }
}
