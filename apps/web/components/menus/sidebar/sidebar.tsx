import styles from './styles.module.css';

import Link from 'next/link';
import { NavigationMenuProps } from 'types/navigation';
import Icon from 'components/icons/icon';

export default function Sidebar({
  selectedPage,
  navigation,
}: {
  selectedPage: string;
  navigation: NavigationMenuProps;
}): JSX.Element {
  return (
    <div className={styles.sideBar}>
      {navigation.items.map((item) => (
        <Link
          href={item.href}
          className={`${styles.navLink} ${
            selectedPage === item.href ? 'selected' : ''
          }`}
          key={item.href}
        >
          {item.image ? (
            <Icon src={`/${item.image}`} width={24} height={24} />
          ) : (
            ''
          )}
          {item.label}
        </Link>
      ))}
    </div>
  );
}
