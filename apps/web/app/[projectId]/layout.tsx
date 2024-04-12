"use client";

import "./style.css";

import React, { useMemo } from "react";
import Sidebar from "components/menus/sidebar/sidebar";
import Header from "components/header/header";
import { NavigationMenuProps as NavigationMenuProperties } from "../../types/navigation";
import { UserAuthWrapper } from "lib/wrappers/user-auth-wrapper";
import { useMobxStore } from "lib/mobx/store-provider";
import { Brush, Database, Settings2, Workflow } from "lucide-react";
import { usePathname } from "next/navigation";

function useNavigation(params: { projectId: string }) {
  return useMemo(
    () => ({
      items: [
        {
          href: `/${params["projectId"]}/edit`,
          label: "UI Editor",
          image: <Brush size={16} />,
        },
        {
          href: `/${params["projectId"]}/data`,
          label: "Database",
          image: <Database size={16} />,
        },
        {
          href: `/${params["projectId"]}/workflow`,
          label: "Workflow",
          image: <Workflow size={16} />,
        },
        {
          href: `/${params["projectId"]}/settings`,
          label: "Project Settings",
          image: <Settings2 size={16} />,
        },
      ],
    }),
    [params]
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
    <UserAuthWrapper>
      {renderContent(useNavigation(params), children)}
    </UserAuthWrapper>
  );
}

function renderContent(
  navigations: NavigationMenuProperties,
  children: React.ReactNode
) {
  const pathName = usePathname();

  return (
    <div className="w-full h-full flex flex-col justify-start items-center overflow-hidden">
      <Header headerTitle="Project Name" />
      <div className="flex-1 flex w-full overflow-hidden">
        <div className="w-full h-full flex px-[50px] py-[20px] gap-2.5">
          <Sidebar navigation={navigations} selectedPage={pathName ?? ""} />
          <div className="flex-1 overflow-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
