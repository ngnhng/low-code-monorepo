import type { Metadata } from "next";

export const metadata: Metadata = {
   title: "Projects | ",
   description: "",
};

export default function RootLayout({
   children,
}: {
   children: React.ReactNode;
}): JSX.Element {
   return <div className="main">{children}</div>;
}
