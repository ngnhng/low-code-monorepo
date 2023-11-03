"use client";

import "./styles.css";

import { useEffect } from "react";
import useLocalStorage from "../../hooks/useLocalStorage";
import { redirect } from "next/navigation";

import Sidebar from "./components/Sidebar";

export default function Page() {
   // const [accessToken] = useLocalStorage<string | null>("access_token", null);
   const accessToken: string = "trole1234";

   if (accessToken === "" || !accessToken) redirect(`/auth/login`);
   if (accessToken === null) return <div className="content"></div>;

   return (
      <div className="content">
         <Sidebar />
         <div className="page">
            <div className="lePage"></div>
         </div>
      </div>
   );
}
