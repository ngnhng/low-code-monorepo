export type NavigationMenuItems = {
  label: string;
  href: string;
  image: JSX.Element;
  children?: NavigationMenuItems[];
}[];

export type NavigationMenuProps = {
  items: NavigationMenuItems;
};

export type NavigationMenuState = {
  isOpen: boolean;
};
