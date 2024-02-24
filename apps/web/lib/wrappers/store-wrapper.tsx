'use client';

import type { FC, ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import { useMobxStore } from 'lib/mobx/store-provider';
import { useEffect } from 'react';
import useSWR from 'swr';

interface IStoreWrapper {
  children: ReactNode;
}

// StoreWrapper is used to initialize the store.
const StoreWrapper: FC<IStoreWrapper> = observer((properties) => {
  const { children } = properties;

  //store
  const {
    user: { setDefaultUser },
    appConfig: { envConfig, fetchEnvConfig },
  } = useMobxStore();

  const { data: env } = useSWR('ENV_CONFIG', () => fetchEnvConfig(), {
    revalidateIfStale: false,
    revalidateOnFocus: false,
  });

  useEffect(() => {
    // if no_auth, set default user
    if (env?.mode.no_auth) {
      setDefaultUser();
    }
  }, [envConfig]);

  if (!env) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
});

export default StoreWrapper;
