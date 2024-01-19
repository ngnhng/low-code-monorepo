'use client';

import { usePathname } from 'next/navigation';
import { Gabarito } from 'next/font/google';

import NavBar from 'components/navigation/nav-bar';
import { UserAuthWrapper } from 'lib/wrappers/user-auth-wrapper';
import Icon from 'components/icons/icon';
import Sidebar from 'components/menus/sidebar/sidebar';

const font = Gabarito({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const path = usePathname();

  return (
    <UserAuthWrapper>
      <div className="main">
        <NavBar />
        <div className="content">
          <div className="side">
            <button className={`createButton ${font.className}`}>
              <Icon
                src="/plus.png"
                width={24}
                height={24}
                color="rgb(141, 98, 134)"
              />
              New project
            </button>
            <Sidebar
              selectedPage={path}
              navigation={{
                items: [
                  {
                    href: '/projects',
                    label: 'Projects',
                    image: 'projects.png',
                  },
                ],
              }}
            />
          </div>
          <div className="pageWrapper">{children}</div>
        </div>
      </div>
    </UserAuthWrapper>
  );
}
