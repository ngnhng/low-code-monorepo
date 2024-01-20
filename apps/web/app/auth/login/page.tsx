'use client';

import styles from './styles.module.css';

import Image from 'next/image';
import Link from 'next/link';
import { useUserAuth } from '../../../hooks/use-user-auth';

export default function Page() {
  const { isLoading, user } = useUserAuth('sign-in');

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isLoading && !user) {
    return (
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <div className={styles.loginLabel}>Sign in with:</div>
          <div className={styles.methodsList}>
            <Link href="/api/auth" className={styles.gLoginButton}>
              <div className={styles.contentWrapper}>
                <Image
                  src="/g-logo.png"
                  alt="Google logo"
                  width={30}
                  height={30}
                />
                <span className={styles.textContainer}>Google</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
