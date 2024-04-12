"use client";

import { useRouter } from "next/navigation";
import { useMobxStore } from "lib/mobx/store-provider";
import { useEffect } from "react";

export default function Page({ params }: { params: { projectId: string } }) {
  const router = useRouter();
  const {
    projectData: { currentProjectId },
  } = useMobxStore();

  console.log("params", params);
  console.log("currentProjectId", currentProjectId);

  useEffect(() => {
    console.log("redirecting", `/${currentProjectId}/edit`);
    router.push(`/${params["projectId"]}/edit`);
  }, [params]);
}
