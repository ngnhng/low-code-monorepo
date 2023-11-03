import type { Metadata } from "next";

import NavBar from "../components/NavBar";

export const metadata: Metadata = {
   title: "Projects | ",
   description: "",
};

export default function RootLayout({
   children,
}: {
   children: React.ReactNode;
}): JSX.Element {
   return (
      <div className="main">
         <NavBar />
         {children}
      </div>
   );
}
