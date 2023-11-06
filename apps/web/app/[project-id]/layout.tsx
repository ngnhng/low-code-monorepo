"use client";

import "./style.css";

import Header from "./components/Header";
import NavBar from "./components/NavBar";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Layout({
   children,
   params,
}: Readonly<{
   children: React.ReactNode;
   params: { "project-id": string };
}>): JSX.Element {
   const path = usePathname();
   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [loading, setLoading] = useState(true);

   const authUrl = "/api/auth/check";
   const loginRedirectUrl = "/auth/login";

   const router = useRouter();

   useEffect(() => {
      axios
         .get(authUrl)
         .then((res) => {
            setIsLoggedIn(res.data.result);
            setLoading(false);
         })
         .catch((err) => {});
   }, []);

   const conditionalRender = () => {
      if (loading) {
         return <div>Loading...</div>;
      }

      if (!isLoggedIn) {
         router.push(loginRedirectUrl); // Redirect to login page if not logged in
         return <></>;
      }

      return (
         <div className="main">
            <Header headerTitle="Project Name" />
            <div className="content">
               <NavBar
                  selectedPage={path.split("/").at(-1) ?? ""}
                  projectId={params["project-id"]}
               />
               <div className="childContainer">{children}</div>
            </div>
         </div>
      );
   };

   return conditionalRender();
}
