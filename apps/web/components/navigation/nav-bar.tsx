'use client';

import styles from './style.module.css';

import Link from 'next/link';
import Image from 'next/image';

const NavLink = ({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <Link href={href}>
    <div className={className}>{children}</div>
  </Link>
);

export default function NavBar() {
  const renderNavLinks = () => {
    return (
      <>
        <NavLink href="./projects" className="px-4 py-2.5 font-medium text-sm rounded-md hover:bg-slate-100">
          Projects
        </NavLink>
      </>
    );
  };

  const renderUserSection = () => {
    return (
      <div className="flex px-4 py-2.5 items-center gap-2.5 text-sm font-semibold rounded-md hover:bg-slate-100">
        <Image
          src="/g-logo.png"
          width={30}
          height={30}
          alt="User profile"
          priority
        />
        <div className={styles.userName}>Test userName</div>
      </div>
    );
  };

  return (
    <nav className="w-full h-16 px-52 flex items-center justify-between border-2 border-b-gray-100">
      <div className="flex gap-2.5 items-center">
        <NavLink href="./">
          <div className="bg-gray-900 px-4 py-2.5 text-white font-semibold rounded-md text-sm">
            YALC
          </div>
        </NavLink>
        {renderNavLinks()}
      </div>
      <div>{renderUserSection()}</div>
    </nav>
  );
}
