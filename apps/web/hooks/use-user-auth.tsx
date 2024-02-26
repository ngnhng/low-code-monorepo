'use client';

import { useMobxStore } from 'lib/mobx/store-provider';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import useSWR from 'swr';
import { useLocalStorage } from './use-local-storage';

export const useUserAuth = (
  route: 'sign-in' | 'sign-out' | 'check' | 'revalidate' | null = 'revalidate',
) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessToken = searchParams.get('access_token');

  const [at, setAt] = useLocalStorage('yalc_at', '');

  const {
    user: { fetchCurrentUser, signOut },
    appConfig: { envConfig },
  } = useMobxStore();

  const {
    data: user,
    isLoading,
    error,
    mutate,
  } = useSWR('CURRENT_USER_DETAILS', () => fetchCurrentUser(), {
    refreshInterval: 0,
    shouldRetryOnError: true,
    revalidateOnFocus: false,
  });

  // if error, sign out and redirect to login page
  useEffect(() => {
    if (error !== undefined) {
      signOut();
      router.push('/auth/login?error=unauthorized');
    }
  }, [error]);

  // check user and access token in the url
  useEffect(() => {
    console.log('useUserAuth', route, user, envConfig);

    switch (route) {
      case 'revalidate': {
        if (!user && !isLoading) {
          router.push('/auth/login?error=revalidate');
        }
        break;
      }
      case 'sign-in': {
        // found user and no access token in the url
        // redirect to projects page
        if (accessToken) {
          setAt(accessToken);
          router.push('/projects');
        } else if (!user && !accessToken) {
          // no user and no access token in the url
          router.push('/auth/login?error=sign-in');
        } else if (user && !accessToken) {
          // found user and no access token in the url
          // redirect to projects page
          router.push('/projects');
        }
        break;
      }
      default: {
        break;
      }
    }
  }, [user, envConfig, isLoading]);

  // trigger re-fetch when new access token is set
  useEffect(() => {
    mutate();
  }, [at]);

  return {
    isLoading,
    user,
    error,
    mutate,
  };
};
