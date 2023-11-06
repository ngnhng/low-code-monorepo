"use client";

import "./style.css";

import Header from "./components/Header";
import MenuBar from "./components/MenuBar";

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
   const [authState] = useAuth();
   const router = useRouter();

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
                     <MenuBar
                        selectedPage={path.split("/").at(-1) ?? ""}
                        projectId={params["project-id"]}
                     />
                     <div className="childContainer">{children}</div>
                  </div>
               </div>
            );
         case AuthState.LOGGED_OUT:
            router.push(loginRedirectUrl);
			return <></>;
      }
   };

   return conditionalRender();
}
