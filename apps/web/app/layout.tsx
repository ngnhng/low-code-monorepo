import "./globals.css";
import type { Metadata } from "next";
import { Gabarito } from "next/font/google";

export const metadata: Metadata = {
   title: "Test",
   description: "",
};

const gabarito = Gabarito({ subsets: ["latin"] });

export default function RootLayout({
   children,
}: {
   children: React.ReactNode;
}): JSX.Element {
   return (
      <html lang="en">
         <body className={gabarito.className}>{children}</body>
      </html>
   );
}
