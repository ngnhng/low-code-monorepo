'use client';

import './style.css';

import React, { useMemo } from 'react';
import Sidebar from 'components/menus/sidebar/sidebar';
import Header from '../../components/header/header';
import { NavigationMenuProps as NavigationMenuProperties } from '../../types/navigation';
import { UserAuthWrapper } from '../../lib/wrappers/user-auth-wrapper';
import { usePathname } from 'next/navigation';
import { Brush, Database, Workflow, Settings2 } from 'lucide-react';

function useNavigation(params: { projectId: string }) {
  return useMemo(
    () => ({
      items: [
        {
          href: `/${params['projectId']}/edit`,
          label: 'UI Editor',
          image: <Brush size={16} />,
        },
        {
          href: `/${params['projectId']}/data`,
          label: 'Database',
          image: <Database size={16} />,
        },
        {
          href: `/${params['projectId']}/workflow`,
          label: 'Workflow',
          image: <Workflow size={16} />,
        },
        {
          href: `/${params['projectId']}/settings`,
          label: 'Project Settings',
          image: <Settings2 size={16} />,
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
      {renderContent(useNavigation(params), children)}
    </UserAuthWrapper>
  );
}

function renderContent(
  navigations: NavigationMenuProperties,
  children: React.ReactNode,
) {
  const pathName = usePathname();
  return (
    <div className="w-full h-full flex flex-col">
      <Header headerTitle="Project Name" />
      <div className="w-full flex px-[50px] py-[20px] gap-2.5 flex-1">
        <Sidebar navigation={navigations} selectedPage={pathName ?? ''} />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
