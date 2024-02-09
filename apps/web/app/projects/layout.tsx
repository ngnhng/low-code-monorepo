'use client';

import { usePathname } from 'next/navigation';
import { Inter } from 'next/font/google';

import NavBar from 'components/navigation/nav-bar';
import { UserAuthWrapper } from 'lib/wrappers/user-auth-wrapper';

const font = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const path = usePathname();

  return (
    <UserAuthWrapper>
      <div className="w-full min-h-full flex flex-col">
        <NavBar />
        <div className="flex-1 px-52 w-full h-full pt-12 flex flex-col gap-8">
          {children}
        </div>
      </div>
    </UserAuthWrapper>
  );
}
