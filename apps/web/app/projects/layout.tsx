'use client';

import { UserAuthWrapper } from 'lib/wrappers/user-auth-wrapper';
import { NavBar } from 'components/navigation/nav-bar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {

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
