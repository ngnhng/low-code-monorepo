'use client';

import './style.css';

import React, { useMemo } from 'react';
import Sidebar from 'components/menus/sidebar/sidebar';
import Header from 'components/header/header';
import { NavigationMenuProps as NavigationMenuProperties } from '../../types/navigation';
  // eslint-disable-next-line no-unused-vars
import { UserAuthWrapper } from '../../lib/wrappers/user-auth-wrapper';
import { usePathname } from 'next/navigation';
import { Brush, Database, Workflow, Settings2 } from 'lucide-react';
import { useMobxStore } from 'lib/mobx/store-provider';

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
  const { projectId } = params;
  const {
    projectData: { setCurrentProjectId },
  } = useMobxStore();

  if (projectId) {
    setCurrentProjectId(projectId);
  }
  return (
    <>
      {renderContent(useNavigation(params), children)}
    </>
  );
}

function renderContent(
  navigations: NavigationMenuProperties,
  children: React.ReactNode,
) {
  const pathName = usePathname();

  console.log("Pathname:", pathName);

  return (
    <div className="w-full h-full flex flex-col justify-start items-center overflow-hidden">
      <Header headerTitle="Project Name" />
      <div className="flex-1 flex w-full overflow-hidden">
        <div className="w-full h-full flex px-[50px] py-[20px] gap-2.5">
          <Sidebar navigation={navigations} selectedPage={pathName ?? ''} />
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
