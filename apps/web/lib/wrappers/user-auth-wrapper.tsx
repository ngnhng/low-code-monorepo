'use client';

import { FC, ReactNode, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useMobxStore } from '../mobx/store-provider';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

export interface IUserAuthWrapper {
  children: ReactNode;
}

export const UserAuthWrapper: FC<IUserAuthWrapper> = observer((properties) => {
  const { children } = properties;

  const router = useRouter();

  //store
  const {
    user: { fetchCurrentUser },
  } = useMobxStore();

  const {
    data: user,
    isLoading,
    error,
  } = useSWR('CURRENT_USER_DETAILS', () => fetchCurrentUser(), {
    refreshInterval: 0,
    shouldRetryOnError: true,
    revalidateOnFocus: false,
  });

  useEffect(() => {
    if (error !== undefined || (!user && !isLoading)) {
      router.push('/auth/login?error=unauthorized');
    }
  }, [error, user]);

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
