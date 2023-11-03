"use client";

import "./style.css";

import Header from "./components/Header";
import NavBar from "./components/NavBar";

import { usePathname, redirect } from "next/navigation";
import useLocalStorage from "../../hooks/useLocalStorage";

export default function Layout({
   children,
   params
}: {
   children: React.ReactNode;
   params: { "project-id": string }
}): JSX.Element {
   const path = usePathname();
   // const [accessToken] = useLocalStorage<string | null>("access_token", null);
   const accessToken: string = "trole";

   if (accessToken === "" || !accessToken) redirect(`/auth/login`);

   return (
      <div className="main">
         <Header headerTitle="Project Name" />
         <div className="content">
            <NavBar selectedPage={path.split("/").at(-1) ?? ""} projectId={params["project-id"]}/>
            <div className="childContainer">{children}</div>
         </div>
      </div>
   );
}
