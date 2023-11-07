"use client";

import "./style.css";

import Header from "./components/Header";
import Sidebar from "../components/Sidebar";

import { usePathname, useRouter } from "next/navigation";

import useAuth from "../../hooks/useAuth";
import { AuthState } from "../../hooks/useAuth";

export default function Layout({
   children,
   params,
}: Readonly<{
   children: React.ReactNode;
   params: { "project-id": string };
}>): JSX.Element {
   const path = usePathname();
   const router = useRouter();

//   const [authState] = useAuth();
    const authState = AuthState.LOGGED_IN;

   const navigations = [
      {
         url: `/${params["project-id"]}/edit`,
         title: "UI Editor",
         image: "edit.png",
      },
      {
         url: `/${params["project-id"]}/data`,
         title: "Database",
         image: "db.png",
      },
      {
         url: `/${params["project-id"]}/workflow`,
         title: "Workflow",
         image: "workflow.png",
      },
      {
         url: `/${params["project-id"]}/settings`,
         title: "Project Settings",
         image: "settings.png",
      },
   ];

   const loginRedirectUrl = "/auth/login";

   const conditionalRender = () => {
      switch (authState) {
         case AuthState.LOADING:
            return <div>Loading...</div>;
         case AuthState.LOGGED_IN:
            return (
               <div className="main">
                  <Header headerTitle="Project Name" />
                  <div className="content">
                     <Sidebar
                        selectedPage={path ?? ""}
                        navigations={navigations}
                     />
                     <div className="childContainer">{children}</div>
                  </div>
               </div>
            );
         case AuthState.LOGGED_OUT:
            router.push(loginRedirectUrl);
            return <>Loading...</>;
      }
   };

   return conditionalRender();
}
