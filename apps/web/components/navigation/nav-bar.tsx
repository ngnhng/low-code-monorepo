'use client';

import styles from './style.module.css';

import Link from 'next/link';
import Image from 'next/image';
import { observer } from 'mobx-react-lite';
import { useMobxStore } from 'lib/mobx/store-provider';
import { Button } from '@repo/ui';
import useSWR from 'swr';

const NavLink = ({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <Link href={href}>
    <div className={className}>{children}</div>
  </Link>
);

export const NavBar = observer(() => {
  const {
    user: { isLoggedIn, currentUser, fetchCurrentUser },
  } = useMobxStore();

  useSWR('CURRENT_USER_DETAILS', () => fetchCurrentUser(), {
    refreshInterval: 0,
    shouldRetryOnError: true,
    revalidateOnFocus: false,
  });

  const renderNavLinks = () => {
    return (
      <>
        <NavLink
          href="/projects"
          className="px-4 py-2.5 font-medium text-sm rounded-md hover:bg-slate-100"
        >
          Projects
        </NavLink>
      </>
    );
  };

  const renderUserSection = () => {
    return (
      <Button asChild>
        <Link
          className="flex px-4 py-2.5 items-center gap-2.5 select-none max-w-64"
          href={isLoggedIn ? '/profile' : '/auth/login'}
        >
          <Image
            src="/google.svg"
            width={22}
            height={22}
            alt="User profile"
            priority
          />
          <div className={styles.userName}>
            {isLoggedIn ? `Hi, ${currentUser?.display_name}` : 'Sign In'}
          </div>
        </Link>
      </Button>
    );
  };

  return (
    <nav className="w-full h-16 px-52 flex items-center justify-between border-2 border-b-gray-100">
      <div className="flex gap-2.5 items-center">
        <NavLink href="./">
          <div className="bg-gray-900 px-4 py-2.5 text-white font-semibold rounded-md text-sm select-none">
            YALC
          </div>
        </NavLink>
        {renderNavLinks()}
      </div>
      <div>{renderUserSection()}</div>
    </nav>
  );
});
