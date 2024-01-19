'use client';

import './style.css';

import React, { useEffect, useMemo } from 'react';
import './style.css';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from 'components/menus/sidebar/sidebar';
import Header from './components/Header';
import { useMobxStore } from '../../lib/mobx/store-provider';
import { NavigationMenuProps as NavigationMenuProperties } from '../../types/navigation';

const loginRedirectUrl = '/auth/login';

function useNavigation(params: { 'project-id': string }) {
  return useMemo(
    () => ({
      items: [
        {
          href: `/${params['project-id']}/edit`,
          label: 'UI Editor',
          image: 'edit.png',
        },
        {
          href: `/${params['project-id']}/data`,
          label: 'Database',
          image: 'db.png',
        },
        {
          href: `/${params['project-id']}/workflow`,
          label: 'Workflow',
          image: 'workflow.png',
        },
        {
          href: `/${params['project-id']}/settings`,
          label: 'Project Settings',
          image: 'settings.png',
        },
      ],
    }),
    [params],
  );
}

function useAuthRedirect(isLoggedIn: boolean | undefined = false, router: any) {
  useEffect(() => {
    if (isLoggedIn === false) {
      router.push(loginRedirectUrl);
    }
  }, [isLoggedIn, router]);
}

export default function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { 'project-id': string };
}>): JSX.Element {
  const path = usePathname();
  const router = useRouter();
  const {
    appConfig: { envConfig },
    user: { isLoggedIn },
  } = useMobxStore();

  const navigations = useNavigation(params);

  useAuthRedirect(isLoggedIn, router);

  if (envConfig?.mode.no_auth) {
    return renderContent(navigations, path, children);
  }

  if (isLoggedIn) {
    return renderContent(navigations, path, children);
  }

  // At this point, if the user is not logged in, they will be redirected
  // and the following will only be displayed briefly.
  return <>Loading...</>;
}

function renderContent(
  navigations: NavigationMenuProperties,
  path: string,
  children: React.ReactNode,
) {
  return (
    <div className="main">
      <Header headerTitle="Project Name" />
      <div className="content">
        <Sidebar navigation={navigations} selectedPage={path ?? ''} />
        <div className="childContainer">{children}</div>
      </div>
    </div>
  );
}
