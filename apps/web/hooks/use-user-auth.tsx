"use client";

import { useMobxStore } from "lib/mobx/store-provider";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import useSWR from "swr";
import { IUser } from "../types/user";
import { setLocalStorage } from "../lib/local-storage";

export const useUserAuth = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const accessToken = searchParams.get("access_token");

    // set access token in local storage
    accessToken && setLocalStorage("yalc_at", accessToken);

    const {
        user: { fetchCurrentUser },
    } = useMobxStore();

    const {
        data: user,
        isLoading,
        error,
    } = useSWR("USER_AUTH", () => fetchCurrentUser(), {
        refreshInterval: 0,
        shouldRetryOnError: true,
        revalidateOnFocus: false,
    });

    const handleRedirection = useCallback(
        (user: IUser | undefined) => {
            if (user) {
                router.push("/projects");
            }
        },
        [user]
    );

    // check user and access token in the url
    useEffect(() => {
        if (isLoading) return;

        if (accessToken) {
            handleRedirection(user);
        }
    }, [isLoading, user]);

    return {
        isLoading,
        error,
    };
};
