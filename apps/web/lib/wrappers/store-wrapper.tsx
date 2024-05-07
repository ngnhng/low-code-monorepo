"use client";

import type { FC, ReactNode } from "react";
import { observer } from "mobx-react-lite";
import { useMobxStore } from "lib/mobx/store-provider";
import { useEffect } from "react";
import useSWR from "swr";
// import { setLocalStorage } from '../local-storage';

interface IStoreWrapper {
    children: ReactNode;
}

// StoreWrapper is used to initialize the store.
const StoreWrapper: FC<IStoreWrapper> = observer((properties) => {
    const { children } = properties;

    const {
        user: { setDefaultUser },
        appConfig: { fetchEnvConfig },
    } = useMobxStore();

    const { data: env } = useSWR("ENV_CONFIG", () => fetchEnvConfig(), {
        revalidateIfStale: false,
        revalidateOnFocus: false,
    });

    useEffect(() => {
        // if no_auth, set default user
        const setDevUser = async () => {
            if (env?.mode.no_auth) {
                await setDefaultUser();
            }
        };

        setDevUser();
    }, [env]);

    if (!env) {
        return <div>Loading...</div>;
    }

    return <>{children}</>;
});

export default StoreWrapper;
