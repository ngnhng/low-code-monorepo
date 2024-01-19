"use client"

import { useMobxStore } from "lib/mobx/store-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";

export const useUserAuth = (route: "sign-in" | "sign-out" | "revalidate" | null = "revalidate") => {

  const router = useRouter();
 
  const {
    user: { fetchCurrentUser },
	appConfig: { 
		envConfig
	 }
  } = useMobxStore();

  const {
    data: user,
    isLoading,
    error,
    mutate,
  } = useSWR("CURRENT_USER_DETAILS", () => fetchCurrentUser(), {
    refreshInterval: 0,
    shouldRetryOnError: false,
  })

  useEffect(() => {
	console.log("useUserAuth", route, user, envConfig);

	if (route == "revalidate" && !user) {
		router.push("/auth/login");
	}
	if (route == "sign-in" && user) {
		router.push("/projects");
	}
  })

  return {
    isLoading,  
    user,
    mutate
  }
}
