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
import { FC } from "react";
import { useRouter } from "next/navigation";

type SidebarProps = {
  navigation: NavigationMenuProps;
  selectedPage: string;
};

const UserSection = ({ currentUser, signOut }) => {
  const router = useRouter();
  const handleSignOut = () => {
    signOut();
    router.push("/");
  };
  return (
    <div className="flex flex-row gap-x-2 mb-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            <div className="flex flex-row gap-x-2 items-center">
              <Avatar className="h-9 w-9">
                <AvatarImage src={currentUser?.profile_image} alt="avatar" />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">
                  {currentUser?.display_name}
                </p>
              </div>
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

const NavigationItem = ({ item, selectedPage }) => (
  <Link
    href={item.href}
    className={`w-[200px] py-2.5 px-5 flex gap-2.5 items-center hover:bg-slate-50 rounded-md box-content ${
      selectedPage.includes(item.href)
        ? "bg-slate-50 ring-2 ring-slate-300 border"
        : ""
    }`}
    key={item.href}
  >
    {item.image}
    <div className="font-semibold text-sm">{item.label}</div>
  </Link>
);

const Sidebar: FC<SidebarProps> = observer((props) => {
  const { navigation, selectedPage } = props;
  const {
    user: { currentUser, signOut },
  } = useMobxStore();
  return (
    <div className="flex flex-col gap-2.5 justify-between h-full">
      <div>
        {navigation.items.map((item, index) => (
          <NavigationItem item={item} selectedPage={selectedPage} key={index} />
        ))}
      </div>
      <UserSection currentUser={currentUser} signOut={signOut} />
    </div>
  );
});

export default Sidebar;
