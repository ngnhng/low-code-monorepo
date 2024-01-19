export type NavigationMenuItems = {
  label: string;
  href: string;
  image: string;
  children?: NavigationMenuItems[];
}[];

export type NavigationMenuProps = {
  items: NavigationMenuItems;
};

export type NavigationMenuState = {
  isOpen: boolean;
};
