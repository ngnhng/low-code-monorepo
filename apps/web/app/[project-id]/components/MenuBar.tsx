import "./MenuBar.css";

import Link from "next/link";
import Image from "next/image";
import { NavigationProps } from "../../../config/types/Navigation";

export default function MenuBar({
   selectedPage,
   projectId,
}: {
   selectedPage: string;
   projectId: string;
}): JSX.Element {
   const navigations: Required<NavigationProps>[] = [
      {
         url: "edit",
         title: "UI Editor",
         image: "edit.png",
      },
      {
         url: "data",
         title: "Database",
         image: "db.png",
      },
      {
         url: "workflow",
         title: "Workflow",
         image: "workflow.png",
      },
      {
         url: "settings",
         title: "Project Settings",
         image: "settings.png",
      },
   ];

   return (
      <div className="navBar">
         {navigations.map((nav) => (
            <Link
               href={`/${projectId}/${nav.url}`}
               className={`navLink ${
                  selectedPage === nav.url ? "selected" : ""
               }`}
               key={nav.url}
            >
               <Image src={`/${nav.image}`} width={24} height={24} alt="" />
               {nav.title}
            </Link>
         ))}
      </div>
   );
}
