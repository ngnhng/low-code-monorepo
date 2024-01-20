'use client';

import './style.css';

import React, { useMemo } from 'react';
import Sidebar from 'components/menus/sidebar/sidebar';
import Header from './components/Header';
import { NavigationMenuProps as NavigationMenuProperties } from '../../types/navigation';
import { UserAuthWrapper } from '../../lib/wrappers/user-auth-wrapper';

function useNavigation(params: { projectId: string }) {
  return useMemo(
    () => ({
      items: [
        {
          href: `/${params['projectId']}/edit`,
          label: 'UI Editor',
          image: 'edit.png',
        },
        {
          href: `/${params['projectId']}/data`,
          label: 'Database',
          image: 'db.png',
        },
        {
          href: `/${params['projectId']}/workflow`,
          label: 'Workflow',
          image: 'workflow.png',
        },
        {
          href: `/${params['projectId']}/settings`,
          label: 'Project Settings',
          image: 'settings.png',
        },
      ],
    }),
    [params],
  );
}

export default function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { projectId: string };
}>): JSX.Element {
  return (
    <UserAuthWrapper>
      {renderContent(useNavigation(params), params.projectId, children)}
    </UserAuthWrapper>
  );
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
