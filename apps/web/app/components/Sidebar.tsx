import "./Sidebar.css";

import Link from "next/link";
import Image from "next/image";
import { NavigationProps } from "../../config/types/Navigation";
import Icon from "./Icon";

export default function Sidebar({
	selectedPage,
	navigations,
}: {
	selectedPage: string;
	navigations: NavigationProps[];
}): JSX.Element {
	return (
		<div className="sideBar">
			{navigations.map((nav) => (
				<Link
					href={nav.url}
					className={`navLink ${
						selectedPage === nav.url ? "selected" : ""
					}`}
					key={nav.url}
				>
					{nav.image ? (
						<Icon src={`/${nav.image}`} width={24} height={24} />
					) : (
						""
					)}
					{nav.title}
				</Link>
			))}
		</div>
	);
}
