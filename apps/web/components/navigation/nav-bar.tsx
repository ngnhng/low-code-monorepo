"use client";

import styles from "./style.module.css";

import Link from "next/link";
import { observer } from "mobx-react-lite";
import { useMobxStore } from "lib/mobx/store-provider";
import { Button } from "@repo/ui";
import { useRouter } from "next/navigation";

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

const NavLinks = () => (
    <NavLink
        href="/projects"
        className="px-4 py-2.5 font-medium text-sm rounded-md hover:bg-slate-100"
    >
        Projects
    </NavLink>
);

const UserSection = ({ isLoggedIn, currentUser, signOut }) => {
    const router = useRouter();
    const handleSignOut = () => {
        signOut();
        router.push("/");
    };
    return (
        <div className="flex flex-row gap-x-2">
            {isLoggedIn && (
                <Button variant={"link"} onClick={handleSignOut}>
                    Sign Out
                </Button>
            )}
            <Button asChild>
                <Link
                    className="flex px-4 py-2.5 items-center gap-2.5 select-none max-w-64"
                    href={isLoggedIn ? "/profile" : "/auth/login"}
					replace
                >
                    <div className={styles.userName}>
                        {isLoggedIn ? (
                            <div className="flex flex-row gap-x-2">
                                <div className="text-sm font-semibold">
                                    Hi, {currentUser.display_name}
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm font-semibold">Sign In</div>
                        )}
                    </div>
                </Link>
            </Button>
        </div>
    );
};

export const NavBar = observer(() => {
    const {
        user: { isLoggedIn, currentUser, signOut },
    } = useMobxStore();

    return (
        <nav className="w-full h-16 px-52 flex items-center justify-between border-2 border-b-gray-100">
            <div className="flex gap-2.5 items-center">
                <NavLink href="./">
                    <div className="bg-gray-900 px-4 py-2.5 text-white font-semibold rounded-md text-sm select-none">
                        YALC
                    </div>
                </NavLink>
                <NavLinks />
            </div>
            <div>
                <UserSection
                    isLoggedIn={isLoggedIn}
                    currentUser={currentUser}
                    signOut={signOut}
                />
            </div>
        </nav>
    );
});
