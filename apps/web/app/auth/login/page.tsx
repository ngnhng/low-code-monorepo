"use client";

import { useUserAuth } from "hooks/use-user-auth";
import { UserAuthForm } from "./_components/user-auth-form";
import { observer } from "mobx-react-lite";
import { useMobxStore } from "../../../lib/mobx/store-provider";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui";

export default function Page() {
    return (
        <div className="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <blockquote className="text-4xl text-black font-extrabold tracking-tight">
                    <h2>Get your hands on YALC</h2>
                    <h3>Yet another low-code platform</h3>
                </blockquote>
            </div>
            <div className="lg:p-16 xl:p-56">
                <UserAuthPage />
            </div>
        </div>
    );
}

const UserAuthPage = observer(() => {
    const router = useRouter();
    const { isLoading } = useUserAuth();
    const {
        user: { currentUser, signOut },
    } = useMobxStore();

    if (isLoading) {
        return (
            <>
                <div className="text-2xl font-bold">Logging in...</div>
            </>
        );
    }

    if (!currentUser) {
        return (
            <div className="flex flex-col gap-y-2">
                <h2 className="text-2xl font-bold mb-4">Sign in with:</h2>
                <UserAuthForm />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-y-2 justify-start">
            <div className="text-2xl font-bold mb-4">
                Currently logged in as {currentUser.email}
            </div>
            <div>
                <Button
                    variant={"link"}
                    onClick={() => router.push("/projects")}
                    className="py-2 px-4 rounded"
                >
                    Go to projects
                </Button>
            </div>
            <div>
                <Button
                    variant={"link"}
                    onClick={signOut}
                    className="py-2 px-4 rounded mt-2"
                >
                    Sign out
                </Button>
            </div>
        </div>
    );
});
