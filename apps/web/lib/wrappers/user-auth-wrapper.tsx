"use client";

import { FC, ReactNode, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useMobxStore } from "../mobx/store-provider";
import { useRouter } from "next/navigation";
import useSWR from "swr";

export interface IUserAuthWrapper {
    children: ReactNode;
}

export const UserAuthWrapper: FC<IUserAuthWrapper> = observer((properties) => {
    const { children } = properties;

    const router = useRouter();

    const {
        user: { fetchCurrentUser, signOut },
    } = useMobxStore();

    const { data: user, isLoading } = useSWR(
        "USER_AUTH",
        () => fetchCurrentUser(),
        {
            refreshInterval: 0,
            shouldRetryOnError: true,
            revalidateOnFocus: false,
        }
    );

    useEffect(() => {
        if (!user && !isLoading) {
            signOut();
            router.push("/auth/login?error=unauthorized");
        }
    }, [user, isLoading]);

    if (isLoading) {
        // TODO: show loading indicator
        return (
            <>
                <div>Loading...</div>
            </>
        );
    }

    return <>{children}</>;
});
