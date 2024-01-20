'use client';

import styles from './style.module.css';

import Link from 'next/link';
import Image from 'next/image';

const NavLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <Link href={href}>
    <div className={styles.navItem}>{children}</div>
  </Link>
);

export default function NavBar() {

  const renderNavLinks = () => {
    return (
      <>
        <NavLink href="./projects">Projects</NavLink>
        <NavLink href="./">Placeholder #1</NavLink>
        <NavLink href="./">Placeholder #2</NavLink>
        <NavLink href="./">Placeholder #3</NavLink>
      </>
    );
  };

  const renderUserSection = () => {
      return (
        <div className={styles.user}>
          <Image
            src="/g-logo.png"
            width={30}
            height={30}
            alt="User profile"
            priority
          />
          <div className={styles.userInfo}>
            <div className={styles.welcome}>Welcome back</div>
            <div className={styles.userName}>Test userName</div>
          </div>
        </div>
      );
  };

  return (
    <nav className={styles.navBar}>
      <div className={styles.left}>
        <NavLink href="./">
          <div className={styles.home}></div>
        </NavLink>
        {renderNavLinks()}
      </div>
      <div className={styles.right}>{renderUserSection()}</div>
    </nav>
  );
}
