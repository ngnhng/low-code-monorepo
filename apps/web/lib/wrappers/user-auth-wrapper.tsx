import { FC, ReactNode } from 'react';
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
    user: { currentUser, currentUserError, fetchCurrentUser },
    appConfig: { envConfig },
  } = useMobxStore();

  useSWR('CURRENT_USER_DETAILS', () => fetchCurrentUser(), {
    refreshInterval: 0,
    shouldRetryOnError: false,
  });

  if (!currentUser && !currentUserError) {
    // TODO: show loading indicator
    return <></>;
  }

  if (currentUserError) {
    router.replace('/auth/login');
    return <></>;
  }

  return <>{children}</>;
});
