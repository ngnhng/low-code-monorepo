"use client";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@repo/ui";
import Link from "next/link";
import { NavigationMenuProps } from "types/navigation";
import { useMobxStore } from "../../../lib/mobx/store-provider";
import { observer } from "mobx-react-lite";
import { FC, cloneElement, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftToLine, ArrowRightToLine } from "lucide-react";

type SidebarProps = {
    navigation: NavigationMenuProps;
    selectedPage: string;
};

const UserSection = ({ currentUser, signOut, isSidebarOpen }) => {
    const router = useRouter();
    const handleSignOut = () => {
        signOut();
        router.push("/");
    };
    return (
        <div className="flex flex-row gap-x-2 mb-4 max-w-[250px]">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost">
                        <div className="flex flex-row gap-x-2 items-center">
                            <Avatar className="h-9 w-9">
                                <AvatarImage
                                    src={currentUser?.profile_image}
                                    alt="avatar"
                                />
                                <AvatarFallback>SC</AvatarFallback>
                            </Avatar>
                            {isSidebarOpen && (
                                <div>
                                    <p className="text-sm font-medium leading-none overflow-hidden overflow-ellipsis whitespace-nowrap max-w-[200px]">
                                        {currentUser?.display_name}
                                    </p>
                                </div>
                            )}
                        </div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                                {currentUser?.display_name}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {currentUser?.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem>
                            Profile
                            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            Billing
                            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            Settings
                            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem>New Team</DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                        Log out
                        <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

const NavigationItem = ({ item, selectedPage, isSidebarOpen }) => (
    <Link
        href={item.href}
        className={`box-border w-full ${isSidebarOpen ? "py-2.5 px-5" : "py-2.5 flex justify-center"} flex gap-2.5 items-center hover:bg-slate-50 rounded-md ${
            selectedPage.includes(item.href)
                ? "bg-slate-50 ring-2 ring-slate-300 border"
                : ""
        }`}
        key={item.href}
    >
        {cloneElement(item.image, {
            className: `${item.image.props.className}`,
        })}

        {isSidebarOpen && (
            <div className="font-semibold text-sm">{item.label}</div>
        )}
    </Link>
);

const Sidebar: FC<SidebarProps> = observer((props) => {
    const { navigation, selectedPage } = props;
    const {
        user: { currentUser, signOut },
    } = useMobxStore();

    // Add state variable for sidebar open/close
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Function to toggle sidebar open/close
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div
            className={`flex flex-col gap-2.5 justify-between h-full ${isSidebarOpen ? "max-w-[250px]" : "max-w-[50px]"}`}
        >
            <div>
                {navigation.items.map((item) => (
                    <NavigationItem
                        key={item.href}
                        item={item}
                        selectedPage={selectedPage}
                        isSidebarOpen={isSidebarOpen}
                    />
                ))}
            </div>
            <div className="flex flex-col justify-between items-start space-y-4 ">
                <UserSection
                    currentUser={currentUser}
                    signOut={signOut}
                    isSidebarOpen={isSidebarOpen}
                />
                <Button
                    variant="outline"
                    onClick={toggleSidebar}
                    className="flex items-center justify-center"
                >
                    {isSidebarOpen ? (
                        <ArrowLeftToLine size={24} />
                    ) : (
                        <ArrowRightToLine size={24} />
                    )}
                </Button>
            </div>
        </div>
    );
});

export default Sidebar;
