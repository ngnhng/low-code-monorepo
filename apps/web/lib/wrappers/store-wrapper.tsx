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
    user: { currentUser, setDefaultUser },
    appConfig: { envConfig, fetchEnvConfig },
  } = useMobxStore();

  const {
    data: user,
    isLoading,
    error,
    mutate,
  } = useSWR('CURRENT_ENV_CONFIG', () => fetchEnvConfig(), {
    refreshInterval: 0,
    shouldRetryOnError: false,
  });

  useEffect(() => {
    console.log('StoreWrapper', user);
    console.log('StoreWrapper', envConfig);

	// if no_auth, set default user
	if (envConfig?.mode.no_auth) {
		setDefaultUser();
	}
  });

  //  const { projectId, tableId } = useParams();

  return <>{children}</>;
});

export default StoreWrapper;
