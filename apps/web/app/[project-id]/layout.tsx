"use client";

import "./style.css";

import Header from "./components/Header";
import NavBar from "./components/NavBar";

import { usePathname } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }): JSX.Element {
    const path = usePathname();

    return (
        <div className="main">
            <Header headerTitle="Project Name" />
            <div className="content">
                <NavBar selectedPage={path.split("/").at(-1) ?? ""} />
                <div className="childContainer">{children}</div>
            </div>
        </div>
    );
}
