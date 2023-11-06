"use client";

import { usePathname, useRouter } from "next/navigation";
import { Gabarito } from "next/font/google";

import useAuth from "../../hooks/useAuth";
import { AuthState } from "../../hooks/useAuth";

import NavBar from "../components/NavBar";
import Sidebar from "../components/Sidebar";
import { NavigationProps } from "../../config/types/Navigation";
import Icon from "../components/Icon";

const gabarito = Gabarito({ subsets: ["latin"] });

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}): JSX.Element {
	const path = usePathname();
	const router = useRouter();
	// const [authState] = useAuth();
	const authState: AuthState = AuthState.LOGGED_IN;

	const navigations: NavigationProps[] = [
		{
			url: `/projects`,
			title: "Projects",
			image: "list.png",
		},
	];

	switch (authState) {
		case AuthState.LOGGED_IN:
			return (
				<div className="main">
					<NavBar />
					<div className="content">
						<div className="side">
							<button
								className={`createButton ${gabarito.className}`}
							>
								<Icon
									src="/plus.png"
									width={24}
									height={24}
									color="rgb(141, 98, 134)"
								/>
								New project
							</button>
							<Sidebar
								selectedPage={path}
								navigations={navigations}
							/>
						</div>
						<div className="pageWrapper">{children}</div>
					</div>
				</div>
			);
		case AuthState.LOGGED_OUT:
			router.push("/auth/login");
			return <div className="main"></div>;
		default:
			return <div className="main"></div>;
	}
}
