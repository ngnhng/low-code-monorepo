"use client";

import "./styles.css";
import { Button } from "@repo/ui";
import { NavBar } from "components/navigation/nav-bar";
import Link from "next/link";
import { useMobxStore } from "../lib/mobx/store-provider";
import useSWR from "swr";

export default function Page() {
    const {
        user: { fetchCurrentUser },
    } = useMobxStore();

    const { error } = useSWR("user", () => fetchCurrentUser());

    if (error) {
        return <div>Error loading user</div>;
    }

    return (
        <div className="w-full h-full flex flex-col">
            <NavBar />
            <div className="flex-1 flex flex-col px-52 gap-5 justify-center">
                <div className="flex flex-col">
                    <div className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                        Get your hands on YALC
                    </div>
                    <div className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                        Yet another low-code platform
                    </div>
                </div>
                <div className="w-[700px] break-words">
                    Our aim is to provide the users an easy application
                    development process with us literally don't even know what
                    we are doing.
                </div>
                <Button className="w-min" asChild>
                    <Link href="/auth/login">Join us now</Link>
                </Button>
            </div>
        </div>
    );
}
